import { Router } from "express";
import { authenticate } from "../auth/isAuthenticatedMiddleware";
import { getWebhookUrl } from "./handler";

const webhookUrlRouter = Router();

// /webhook-url/
webhookUrlRouter.get("/", authenticate, getWebhookUrl);

export default webhookUrlRouter;
