import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./express";

const PORT = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    /* options */
});

io.on("connection", (socket) => {
    // ...
});

httpServer.listen(PORT);
