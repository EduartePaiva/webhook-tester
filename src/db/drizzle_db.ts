import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// for query purposes
const queryClient = postgres(process.env.DB_URL);
export const db = drizzle(queryClient);
