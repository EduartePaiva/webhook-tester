import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./express";

const PORT = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    /* options */
});

const LOGGED_USERS = new Map<string, string>();

io.on("connection", (socket) => {
    // ...
    console.log(socket.id);
    const userId = socket.data.userId;
    LOGGED_USERS.set(socket.data);
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (typeof token !== "string") {
        return next(new Error("undefined token"));
    }
    // get userID and store in the socket.data
});

app.get("/:userId", (req, res) => {
    const userSocketId = LOGGED_USERS.get(req.params.userId);
    if (userSocketId === undefined) {
        return res.sendStatus(200);
    }
    io.to(userSocketId).emit(req.body);
    return res.sendStatus(200);
});

httpServer.listen(PORT, () => {
    console.log("server is connected!");
});
