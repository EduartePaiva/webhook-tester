import { Router } from "express";
import { validateLoginUserMiddleware, validatePostUserMiddleware } from "../zodMiddlewares/users";
import { createUser, loginUser } from "../handlers/users";
import { authenticateToken } from "../auth";

const usersRouter = Router();

// /users
if (process.env.ACCEPT_NEW_USERS === "yes") {
    usersRouter.post("/", validatePostUserMiddleware, createUser);
}
// /users/login
usersRouter.post("/login", validateLoginUserMiddleware, loginUser);

usersRouter.get("/test_auth", authenticateToken);

export default usersRouter;
