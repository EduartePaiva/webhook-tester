import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { HandleUserEmail, loginUser as loginUserReqType, postUser } from "./zodMiddlewares";
import { db } from "../../db/drizzle_db";
import { users } from "../../db/drizzle_schema/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { generateEmailTemplate } from "./emailTemplate";
import { Resend } from "resend";

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const ONE_DAY_IN_SECONDS = 24 * 60 * 60;
const resend = new Resend(process.env.RESEND_API_TOKEN);

export const createUser = async (req: Request<any, any, postUser>, res: Response) => {
    try {
        const result = await db
            .select({
                id: users.id,
            })
            .from(users)
            .where(eq(users.email, req.body.email.toLowerCase()));
        if (result.length !== 0) return res.status(403).json("email already in use");

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const insert_res = await db
            .insert(users)
            .values({
                email: req.body.email.toLowerCase(),
                userName: req.body.userName,
                password: hashedPassword,
            })
            .returning();
        // todo, save user in the database and confirm user email
        res.status(201).json("user created");
    } catch (err) {
        res.status(500).json(err);
    }
};

export type accessTokenType = {
    id: string;
    email: string;
    name: string;
    expirationDate: number;
};

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
        const expirationDate = Date.now() + ONE_DAY_IN_MILLISECONDS;

        const accessToken = jwt.sign(
            {
                id: user[0].id,
                name: user[0].userName,
                email: req.body.email.toLowerCase(),
                expirationDate,
            } satisfies accessTokenType,
            process.env.ACCESS_TOKEN_SECRET,
        );
        // todo hard coded url
        const webhookURL = `https://webhook.eduartepaiva.com/${user[0].id}`;
        res.status(201).json({
            accessToken,
            webhookURL,
            userName: user[0].userName,
            expirationDate,
        });
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
        const emailHtml = generateEmailTemplate(url.toString());

        // send the email to the user with resend.
        const { data, error } = await resend.emails.send({
            from: "Acme <webhook@eduartepaiva.com>",
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
