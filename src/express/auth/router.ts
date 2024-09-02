import { Router } from "express";
import {
    validateLoginUserMiddleware,
    validatePostUserMiddleware,
    handleUserEmailMiddleware,
} from "./zodMiddlewares";
import { createUser, loginUser, handleEmailSent } from "./handler";

const authRouter = Router();

// /auth
if (process.env.ACCEPT_NEW_USERS === "yes") {
    authRouter.post("/create", validatePostUserMiddleware, createUser);
    authRouter.post("/confirm-email", handleUserEmailMiddleware, handleEmailSent);
}
// /auth/login
authRouter.post("/login", validateLoginUserMiddleware, loginUser);

export default authRouter;
