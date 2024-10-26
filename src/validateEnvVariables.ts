import { z } from "zod";

const envScheme = z.object({
    DB_URL: z.string().min(1),
    ACCEPT_NEW_USERS: z.string(),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    EMAIL_TOKEN_SECRET: z.string().min(1),
    RESEND_API_TOKEN: z.string().min(1),
    ALLOW_CORS: z.string().optional(),
    WEBSITE_URL: z.string().min(1),
    WEBHOOK_URL: z.string().min(4),
});

export type envSchemaType = z.infer<typeof envScheme>;

export const initEverything = () => {
    try {
        envScheme.parse(process.env);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
