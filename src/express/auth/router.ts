import { Router } from "express";
import {
    validateLoginUserMiddleware,
    validatePostUserMiddleware,
    handleUserEmailMiddleware,
    confirmChangePasswordMiddleware,
} from "./zodMiddlewares";
import {
    createUser,
    loginUser,
    handleEmailSent,
    handleChangePassword,
    handleConfirmChangePassword,
} from "./handler";
import { handleAuthenticateResetPassword } from "./isAuthenticatedMiddleware";

const authRouter = Router();

// /auth
if (process.env.ACCEPT_NEW_USERS === "yes") {
    authRouter.post("/create", validatePostUserMiddleware, createUser);
    authRouter.post("/send-email", handleUserEmailMiddleware, handleEmailSent);
}

// /auth/change-password -> this part is for sending the token to the email
authRouter.post("/change-password", handleAuthenticateResetPassword, handleChangePassword);

// /auth/confirm-change-password -> this part receives email token and new password and change it
authRouter.post(
    "/confirm-change-password",
    confirmChangePasswordMiddleware,
    handleConfirmChangePassword,
);

//authRouter.get("/complete-change-pw", authenticate);

// /auth/login
authRouter.post("/login", validateLoginUserMiddleware, loginUser);

export default authRouter;
