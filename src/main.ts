import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    /* options */
});

io.on("connection", (socket) => {
    // ...
});

httpServer.listen(3000);
