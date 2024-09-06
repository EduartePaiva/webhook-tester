import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SocketData } from "../../types";
import { handleUserEmail } from "./zodMiddlewares";
import { db } from "../../db/drizzle_db";
import { users } from "../../db/drizzle_schema/schema";
import { eq } from "drizzle-orm";

export type AuthenticateUserData = {
    user: SocketData;
};

/**
 * The authenticate sets the req.body.user to @type{SocketData}
 */
function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.header("authorization");
    if (typeof token !== "string") {
        return next(new Error("Empty authorization header"));
    }
    const newToken = token.split(" ");
    if (newToken.length < 2 || newToken[0] !== "Bearer") {
        return next(new Error("Invalid token format. The format is: Bearer <jwt token>"));
    }

    // get userID and store in the socket.data
    jwt.verify(newToken[1], process.env.ACCESS_TOKEN_SECRET, (err, data) => {
        if (err !== null) {
            console.log(err);
            return next(new Error("invalid token"));
        }
        const typedData = data as SocketData;
        if (Date.now() > typedData.expirationDate) {
            return next(new Error("token expired"));
        }
        req.body.user = data as SocketData;
    });
    next();
}

async function handleAuthenticateResetPassword(req: Request, res: Response, next: NextFunction) {
    // case user is logged in
    const token = req.header("authorization");
    if (typeof token === "string") {
        return authenticate(req, res, next);
    }
    //case user don't remember password.
    const data = handleUserEmail.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({ error: data.error.message });
    }

    try {
        const userDbData = await db
            .select({ id: users.id, email: users.email })
            .from(users)
            .where(eq(users.email, data.data.email.toLowerCase()));
        if (userDbData.length === 0) {
            return res.status(400).json({ error: "This email is not yet registered!" });
        }
        req.body = {
            user: { email: userDbData[0].email, expirationDate: 0, id: userDbData[0].id, name: "" },
        } satisfies AuthenticateUserData;
        next();
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: "internal server error!" });
    }
}
export { authenticate, handleAuthenticateResetPassword };
