import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { loginUser as loginUserReqType, postUser } from "../zodMiddlewares/users";
import { db } from "../../db/drizzle_db";
import { users } from "../../db/drizzle_schema/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export const createUser = async (req: Request<any, any, postUser>, res: Response) => {
    try {
        const result = await db
            .select({
                id: users.id,
            })
            .from(users)
            .where(eq(users.email, req.body.email));
        if (result.length !== 0) return res.status(403).json("email already in use");

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const insert_res = await db
            .insert(users)
            .values({
                email: req.body.email,
                userName: req.body.userName,
                password: hashedPassword,
            })
            .returning();
        console.log(insert_res);
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
    expirationData: number;
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
            .where(eq(users.email, req.body.email));

        if (user.length != 1) {
            res.status(403).send("user don't exist");
            return;
        }
        if (!(await bcrypt.compare(req.body.password, user[0].password))) {
            res.status(401).send("unauthorized");
            return;
        }
        // generate jwt token
        const accessToken = jwt.sign(
            {
                id: user[0].id,
                name: user[0].userName,
                email: req.body.email,
                expirationData: Date.now() + ONE_DAY_IN_MILLISECONDS,
            } satisfies accessTokenType,
            process.env.ACCESS_TOKEN_SECRET!,
        );

        res.status(201).json({ accessToken });
    } catch (err) {
        return res.status(500).json(err);
    }
};
