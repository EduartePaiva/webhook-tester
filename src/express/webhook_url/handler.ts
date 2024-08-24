import { Request, Response } from "express";
import { SocketData } from "../../types";

export function getWebhookUrl(req: Request<any, any, { user: SocketData }>, res: Response) {
    const userId = req.body.user.id;
    return res.send(`https://webhook.eduartepaiva.com/${userId}`);
}
