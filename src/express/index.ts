import express from "express";
import authRouter from "./auth/router";

const app = express();

app.use(express.json());
app.use("/auth", authRouter);

export default app;
