import { z } from "zod";

const envScheme = z.object({
    DB_URL: z.string().min(1),
    ACCEPT_NEW_USERS: z.string(),
    ACCESS_TOKEN_SECRET: z.string().min(1),
    REFRESH_TOKEN_SECRET: z.string().min(1),
});

export type envSchemaType = z.infer<typeof envScheme>;

export const initEverything = () => {
    envScheme.parse(process.env);
};
