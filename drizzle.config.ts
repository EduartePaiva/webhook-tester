import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
    schema: "./src/db/drizzle_schema/*",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DB_URL!,
    },
});
