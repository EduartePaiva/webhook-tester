import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3000;
const app = express();

const posts = ["hello", "world"];

app.get("/posts", (request, response) => {
    response.json(posts);
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
    /* options */
});

io.on("connection", (socket) => {
    // ...
});

httpServer.listen(PORT);
