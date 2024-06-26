import { users } from "./db/drizzle_schema/schema";
import "dotenv/config";
import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import bcrypt from "bcrypt";
import {
    loginUser,
    postUser,
    validateLoginUserMiddleware,
    validatePostUserMiddleware,
} from "./zod/zodSchemas";
import { db } from "./db/drizzle_db";
import { eq } from "drizzle-orm";

const PORT = 3000;
const app = express();

app.use(express.json());

if (process.env.ACCEPT_NEW_USERS === "yes") {
    app.post(
        "/users",
        validatePostUserMiddleware,
        async (req: Request<any, any, postUser>, res: Response) => {
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
        },
    );
}

app.post(
    "/users/login",
    validateLoginUserMiddleware,
    async (req: Request<any, any, loginUser>, res: Response) => {
        // use bcrypt.compare
        // result = await bcrypt.compare(req.body.password, password_from_db)
    },
);

const httpServer = createServer(app);
const io = new Server(httpServer, {
    /* options */
});

io.on("connection", (socket) => {
    // ...
});

httpServer.listen(PORT);
