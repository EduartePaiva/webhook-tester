import express from "express";
import authRouter from "./auth/router";

const app = express();

app.use(express.json());
app.use("/auth", authRouter);
app.get("/", (req, res) => res.send("Hello from webhook tester"));

export default app;
