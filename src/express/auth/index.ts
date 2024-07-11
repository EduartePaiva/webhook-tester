import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export const authenticateToken = (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"];
    if (authHeader === undefined) {
        return res.sendStatus(401);
    }
    const token = authHeader.split(" ");
    if (token.length !== 2) {
        return res.sendStatus(401);
    }
    const realToken = token[1];
    jwt.verify(realToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err !== null) {
            console.log(err);
            return res.sendStatus(403);
        }
        return res.json(user);
    });
};
