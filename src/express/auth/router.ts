import { Router } from "express";
import {
    validateLoginUserMiddleware,
    validatePostUserMiddleware,
    handleUserEmailMiddleware,
} from "./zodMiddlewares";
import { createUser, loginUser, handleEmailSent, handleChangePassword } from "./handler";
import authenticate from "./isAuthenticatedMiddleware";

const authRouter = Router();

// /auth
if (process.env.ACCEPT_NEW_USERS === "yes") {
    authRouter.post("/create", validatePostUserMiddleware, createUser);
    authRouter.post("/send-email", handleUserEmailMiddleware, handleEmailSent);
}

// /auth/reset-password -> this part is for sending the token to the email
authRouter.get("/change-password", authenticate, handleChangePassword);

//authRouter.get("/complete-change-pw", authenticate);

// /auth/login
authRouter.post("/login", validateLoginUserMiddleware, loginUser);

export default authRouter;
