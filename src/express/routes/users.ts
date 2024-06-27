import { Router } from "express";
import { validateLoginUserMiddleware, validatePostUserMiddleware } from "../zodMiddlewares/users";
import { createUser, loginUser } from "../handlers/users";

const usersRouter = Router();

// api/users
if (process.env.ACCEPT_NEW_USERS === "yes") {
    usersRouter.post("/", validatePostUserMiddleware, createUser);
}
// api/users/login
usersRouter.post("/login", validateLoginUserMiddleware, loginUser);

export default usersRouter;
