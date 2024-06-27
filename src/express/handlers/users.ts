import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { loginUser as loginUserReqType, postUser } from "../zodMiddlewares/users";
import { db } from "../../db/drizzle_db";
import { users } from "../../db/drizzle_schema/schema";
import { eq } from "drizzle-orm";

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
        res.status(500).json("server error");
    }
};

export const loginUser = async (req: Request<any, any, loginUserReqType>, res: Response) => {
    // use bcrypt.compare
    // result = await bcrypt.compare(req.body.password, password_from_db)
};
