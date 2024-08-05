// dot env need to be imported at the start of everything
import { config } from "dotenv";

//this is for pm2
import path from "path";
config({ path: path.join(__dirname, ".env") });

//-----
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./express";
import { Request } from "express";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "./types";
import { initEverything } from "./validateEnvVariables";

initEverything();

const PORT = 3000;

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
        /* options */
    },
);

const LOGGED_USERS = new Map<string, string>();

// socket.io middleware for retrieving data for authentication
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (typeof token !== "string") {
        return next(new Error("undefined token"));
    }
    // get userID and store in the socket.data

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err !== null) {
            console.log(err);
            return next(new Error("invalid token"));
        }
        const typedData = data as SocketData;
        if (Date.now() > typedData.expirationData) {
            return next(new Error("token expired"));
        }

        console.log("USER VERIFIED");
        socket.data = data as SocketData;
    });
    next();
});

io.on("connection", (socket) => {
    console.log("CONNECTION NEW USER ON ID: " + socket.id);
    const userId = socket.data.id;
    LOGGED_USERS.set(userId, socket.id);
    socket.on("disconnect", () => {
        console.log("REMOVING USER FROM LOGGED_USERS: " + userId);
        LOGGED_USERS.delete(userId);
    });
});

app.post("/message/:userId*", (req: Request<{ userId: string; "0": string }>, res) => {
    const userSocketId = LOGGED_USERS.get(req.params.userId);
    if (userSocketId === undefined) {
        return res.sendStatus(200);
    }
    console.log("sending webhook payload to: " + userSocketId);
    io.to(userSocketId).emit("message", {
        extra_url: req.params["0"],
        payload: req.body,
    });
    return res.sendStatus(200);
});

httpServer.listen(PORT, () => {
    console.log("server is running on localhost:" + PORT);
});
