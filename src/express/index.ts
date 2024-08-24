import express from "express";
import authRouter from "./auth/router";
import webhookUrlRouter from "./webhook_url/router";

const app = express();

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/webhook-url", webhookUrlRouter);
app.get("/api", (req, res) => res.send("Hello from webhook tester"));

export default app;
