import jwt from "jsonwebtoken";
import "dotenv/config";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import app from "./express";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { accessTokenType } from "./express/handlers/users";

const PORT = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    /* options */
});

const LOGGED_USERS = new Map<string, string>();

io.on(
    "connection",
    (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, accessTokenType>) => {
        // ...
        console.log(socket.id);
        const userId = socket.data.id;
        LOGGED_USERS.set(userId, socket.id);
        socket.on("disconnect", () => {
            console.log("removing user from webhook");
            LOGGED_USERS.delete(userId);
        });
    },
);

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (typeof token !== "string") {
        return next(new Error("undefined token"));
    }
    // get userID and store in the socket.data
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, data) => {
        if (err !== null) {
            console.log(err);
            return next(new Error("invalid token"));
        }
        console.log(data);
        socket.data = data;
    });
    next();
});

app.post("/message/:userId", (req, res) => {
    console.log("something came here");
    console.log(LOGGED_USERS);
    const userSocketId = LOGGED_USERS.get(req.params.userId);
    if (userSocketId === undefined) {
        return res.sendStatus(200);
    }
    console.log("sending webhook payload to: " + userSocketId);
    io.to(userSocketId).emit("message", req.body);
    return res.sendStatus(200);
});

httpServer.listen(PORT, () => {
    console.log("server is connected!");
});
