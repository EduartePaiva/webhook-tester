import bcrypt from "bcrypt";
import { Request, Response } from "express";
import {
    confirmChangePasswordData,
    handleUserEmail,
    HandleUserEmail,
    loginUser as loginUserReqType,
    postUser,
} from "./zodMiddlewares";
import { db } from "../../db/drizzle_db";
import { resetPassword, users } from "../../db/drizzle_schema/schema";
import { eq, lt } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { generateEmailTemplateResetPassword, generateEmailTemplateSignUp } from "./emailTemplate";
import { Resend } from "resend";
import { getErrorMessage } from "../../lib/utils";
import { AuthenticateUserData } from "./isAuthenticatedMiddleware";
import { resetPasswordToken } from "./zodDefinitions";

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const ONE_DAY_IN_SECONDS = 24 * 60 * 60;
const ONE_HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
const resend = new Resend(process.env.RESEND_API_TOKEN);

async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export const createUser = async (req: Request<any, any, postUser>, res: Response) => {
    try {
        const emailResult = handleUserEmail.safeParse(
            jwt.verify(req.body.token, process.env.EMAIL_TOKEN_SECRET),
        );
        if (!emailResult.success) {
            return res.status(400).json({ error: emailResult.error.message });
        }
        const email = emailResult.data.email.toLowerCase();
        const result = await db
            .select({
                id: users.id,
            })
            .from(users)
            .where(eq(users.email, email));
        if (result.length !== 0) {
            return res.status(403).json({ error: "email already in use" });
        }
        const insert_res = await db
            .insert(users)
            .values({
                email,
                userName: req.body.userName,
                password: await hashPassword(req.body.password),
            })
            .returning();

        // now I have to return a token like in login
        const loginPayload = generateLoginPayload({
            userEmail: email,
            userId: insert_res[0].id,
            userName: req.body.userName,
        });
        res.status(201).json(loginPayload);
    } catch (err) {
        console.error(err);
        const errMessage = getErrorMessage(err);
        return res.status(500).json({ error: errMessage });
    }
};

export type accessTokenType = {
    id: string;
    email: string;
    name: string;
    expirationDate: number;
};

type loginPayload = {
    accessToken: string;
    webhookURL: string;
    userName: string;
    expirationDate: number;
};

function generateLoginPayload(data: {
    userId: string;
    userName: string;
    userEmail: string;
}): loginPayload {
    const expirationDate = Date.now() + ONE_DAY_IN_MILLISECONDS;
    const accessToken = jwt.sign(
        {
            id: data.userId,
            name: data.userName,
            email: data.userEmail,
            expirationDate,
        } satisfies accessTokenType,
        process.env.ACCESS_TOKEN_SECRET,
    );
    // todo hard coded url
    const webhookURL = `https://webhook.eduartepaiva.com/${data.userId}`;
    return { accessToken, expirationDate, userName: data.userName, webhookURL };
}

export const loginUser = async (req: Request<any, any, loginUserReqType>, res: Response) => {
    try {
        // authorize user
        const user = await db
            .select({
                id: users.id,
                password: users.password,
                userName: users.userName,
            })
            .from(users)
            .where(eq(users.email, req.body.email.toLowerCase()));
        if (user.length != 1 || !(await bcrypt.compare(req.body.password, user[0].password))) {
            res.status(401).send("Invalid email or password");
            return;
        }
        // generate jwt token
        const loginPayload = generateLoginPayload({
            userEmail: req.body.email,
            userId: user[0].id,
            userName: user[0].userName,
        });
        res.status(201).json(loginPayload);
    } catch (err) {
        return res.status(500).json(err);
    }
};

export const handleEmailSent = async (req: Request<any, any, HandleUserEmail>, res: Response) => {
    // req.body.email
    // what do I have to do here?
    // cryptograph the email in a jwt
    // create a link like: https://webhook.eduartepaiva.com/complete-signup?token=cryptedemail
    // in the frontend the user will access this link and

    // before everything check if email already exists.
    try {
        // check if email already exists.
        const result = await db
            .select({
                id: users.id,
            })
            .from(users)
            .where(eq(users.email, req.body.email.toLowerCase()));
        if (result.length !== 0) return res.status(403).json({ error: "email already in use" });

        // create a email token, then a url and then a email template with this url
        const emailToken = jwt.sign(
            {
                email: req.body.email,
            } satisfies HandleUserEmail,
            process.env.EMAIL_TOKEN_SECRET,
            { expiresIn: ONE_DAY_IN_SECONDS },
        );
        const url = new URL("https://webhook.eduartepaiva.com/complete-signup");
        url.searchParams.set("token", emailToken);
        const emailHtml = generateEmailTemplateSignUp(url.toString());

        // send the email to the user with resend.
        const { data, error } = await resend.emails.send({
            from: "Webhook Tester <webhook@eduartepaiva.com>",
            to: [req.body.email],
            subject: "webhook email confirmation",
            html: emailHtml,
        });

        if (error) {
            console.error(error);
            return res.status(400).json({ error });
        }

        // return success status
        res.status(200).json({ data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "internal server error" });
    }
};

export const handleChangePassword = async (
    req: Request<any, any, AuthenticateUserData>,
    res: Response,
) => {
    try {
        // delete expired at the dp
        const promise1 = db.delete(resetPassword).where(lt(resetPassword.expireAt, new Date()));
        // create a token with the id of the the insertion of resetPassword
        const expirationDate = new Date(Date.now() + ONE_HOUR_IN_MILLISECONDS);

        const resetId = await db
            .insert(resetPassword)
            .values({
                userId: req.body.user.id,
                expireAt: expirationDate,
            })
            .returning({ id: resetPassword.id });
        if (resetId.length !== 1) {
            return res.status(400).json({ error: "database error" });
        }
        // this token contains the id of a row in the resetPassword table
        const resetToken = jwt.sign(
            { resetId: resetId[0].id, exp: Math.floor(expirationDate.getTime() / 1000) },
            process.env.EMAIL_TOKEN_SECRET,
        );

        // send the email to the user with resend.
        const url = new URL(`${process.env.WEBSITE_URL}/reset-password`);
        url.searchParams.set("token", resetToken);

        // this template needs to be a template for change password
        const emailHtml = generateEmailTemplateResetPassword(url.toString());

        const { error } = await resend.emails.send({
            from: "Webhook Tester <webhook@eduartepaiva.com>",
            to: [req.body.user.email],
            subject: "webhook password reset",
            html: emailHtml,
        });

        if (error) {
            console.error(error);
            return res.status(400).json({ error: error.message });
        }

        await promise1;
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        if (err instanceof Error) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: "internal server error" });
    }
};

export const handleConfirmChangePassword = async (
    req: Request<any, any, confirmChangePasswordData>,
    res: Response,
) => {
    // this needs the token and the new password
    try {
        // get token that it's the id of the changePassword row
        const jwtData = jwt.verify(req.body.token, process.env.EMAIL_TOKEN_SECRET);
        const tokenData = resetPasswordToken.safeParse(jwtData);
        if (!tokenData.success) {
            return res.status(400).json({ error: "Invalid token" });
        }

        // delete the specific
        const delResult = await db
            .delete(resetPassword)
            .where(eq(resetPassword.id, tokenData.data.resetId))
            .returning();

        if (delResult.length !== 1) {
            return res.status(400).json({ error: "token already used." });
        }
        // delete all tokens that is from that user
        const promise1 = db
            .delete(resetPassword)
            .where(eq(resetPassword.userId, delResult[0].userId));

        // update the user password, need hash the password.
        const userUpdated = await db
            .update(users)
            .set({ password: await hashPassword(req.body.password) })
            .where(eq(users.id, delResult[0].userId))
            .returning();
        if (userUpdated.length !== 1) {
            return res.status(500).json({ error: "database error" });
        }

        await promise1;
        // generate jwt token
        const loginPayload = generateLoginPayload({
            userEmail: userUpdated[0].email,
            userId: userUpdated[0].id,
            userName: userUpdated[0].userName,
        });
        res.status(201).json(loginPayload);
    } catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: "internal server error" });
    }
};
