import { Router } from "express";
import { validateLoginUserMiddleware, validatePostUserMiddleware } from "../zodMiddlewares/users";
import { createUser, loginUser } from "../handlers/auth";
import { authenticateToken } from "../auth";

const authRouter = Router();

// /users
if (process.env.ACCEPT_NEW_USERS === "yes") {
    authRouter.post("/create", validatePostUserMiddleware, createUser);
}
// /users/login
authRouter.post("/login", validateLoginUserMiddleware, loginUser);

authRouter.get("/test_auth", authenticateToken);

export default authRouter;
