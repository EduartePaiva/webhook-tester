import express, { Request, Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";
import bcrypt from "bcrypt";
import { postUser, validatePostUserMiddleware } from "./zod/zodSchemas";

const PORT = 3000;
const app = express();

app.use(express.json());

if (process.env.ACCEPT_NEW_USERS !== undefined && process.env.ACCEPT_NEW_USERS === "yes") {
    app.post(
        "/users",
        validatePostUserMiddleware,
        (req: Request<any, any, postUser>, res: Response) => {
            res.json(req.body.email);
        },
    );
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
    /* options */
});

io.on("connection", (socket) => {
    // ...
});

httpServer.listen(PORT);
