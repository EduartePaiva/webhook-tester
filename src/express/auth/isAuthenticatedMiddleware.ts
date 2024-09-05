import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SocketData } from "../../types";

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
export default authenticate;
