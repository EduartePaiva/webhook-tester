import { Router } from "express";
import { validateLoginUserMiddleware, validatePostUserMiddleware } from "./zodMiddlewares";
import { createUser, loginUser } from "./handler";

const authRouter = Router();

// /auth
if (process.env.ACCEPT_NEW_USERS === "yes") {
    authRouter.post("/create", validatePostUserMiddleware, createUser);
}
// /auth/login
authRouter.post("/login", validateLoginUserMiddleware, loginUser);

export default authRouter;
