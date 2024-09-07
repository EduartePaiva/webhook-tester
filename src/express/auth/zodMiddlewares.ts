import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const passwordVerify = z.string().superRefine((val, ctx) => {
    if (val.length < 8) {
        ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: 8,
            type: "string",
            inclusive: true,
            message: "password should be at least 8 characters long",
        });
    }
    if (val.toUpperCase() === val) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "password must contain at least one lowercase letter",
        });
    }
    if (val.toLowerCase() === val) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "password must contain at least one uppercase letter",
        });
    }
    let haveNumber = false;
    let numbers = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    for (const char of val) {
        if (numbers.has(char)) {
            haveNumber = true;
            break;
        }
    }
    if (!haveNumber) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "password must contain at least one number",
        });
    }
});

const createUser = z.object({
    userName: z
        .string()
        .min(3, "user name should be at least 3 characters long")
        .max(20, "user name should be at max 20 characters long"),
    token: z.string(),
    password: passwordVerify,
});

const loginUser = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const handleUserEmail = z.object({
    email: z.string().email("invalid email"),
});
export type HandleUserEmail = z.infer<typeof handleUserEmail>;
export const handleUserEmailMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.req.body = handleUserEmail.parse(req.body);
        return next();
    } catch (error) {
        return res.status(400).json(error);
    }
};

export type postUser = z.infer<typeof createUser>;
export const validatePostUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.req.body = createUser.parse(req.body);
        return next();
    } catch (error) {
        return res.status(400).json(error);
    }
};

export type loginUser = z.infer<typeof loginUser>;
export const validateLoginUserMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // todo: use sageParse in others things
    const zodResult = loginUser.safeParse(req.body);
    if (!zodResult.success) {
        return res.status(400).json({ error: zodResult.error.message });
    }
    res.req.body = zodResult.data;
    return next();
};

const confirmChangePasswordData = z.object({
    token: z.string(),
    password: passwordVerify,
});
export type confirmChangePasswordData = z.infer<typeof confirmChangePasswordData>;
export const confirmChangePasswordMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const zodResult = confirmChangePasswordData.safeParse(req.body);
    if (!zodResult.success) {
        return res.sendStatus(400).json({ error: zodResult.error.message });
    }
    req.body = zodResult.data;
    next();
};
