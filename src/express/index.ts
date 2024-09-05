import express from "express";
import authRouter from "./auth/router";
import webhookUrlRouter from "./webhook_url/router";

const app = express();

// allowing cors for testing this is temporary
if (process.env.ALLOW_CORS !== undefined && process.env.ALLOW_CORS === "yes") {
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
        res.setHeader("Access-Control-Allow-Headers", "*");
        res.setHeader("Access-Control-Max-Age", 2592000); // 30 days
        next();
    });
}

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/webhook-url", webhookUrlRouter);
app.get("/api", (req, res) => res.send("Hello from webhook tester"));

export default app;
