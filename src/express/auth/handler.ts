import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { HandleUserEmail, loginUser as loginUserReqType, postUser } from "./zodMiddlewares";
import { db } from "../../db/drizzle_db";
import { users } from "../../db/drizzle_schema/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { generateEmailTemplate } from "./emailTemplate";

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const ONE_DAY_IN_SECONDS = 24 * 60 * 60;

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

export const handleEmailSent = (req: Request<any, any, HandleUserEmail>, res: Response) => {
    // req.body.email
    // what do I have to do here?
    // cryptograph the email and a secret
    // create a link like: https://webhook.eduartepaiva.com/create-user?token=cryptedemail
    // in the frontend the user will access this link and
    const emailToken = jwt.sign(
        {
            email: req.body.email,
        } satisfies HandleUserEmail,
        process.env.EMAIL_TOKEN_SECRET,
        { expiresIn: ONE_DAY_IN_SECONDS },
    );
    const emailHtml = generateEmailTemplate(emailToken);
    // now I need to send this email using resend
};
