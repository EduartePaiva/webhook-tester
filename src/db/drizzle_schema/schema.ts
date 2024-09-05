import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").notNull().defaultRandom().primaryKey(),
    userName: text("user_name").notNull(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resetPassword = pgTable("reset_password", {
    id: uuid("id").notNull().defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    expireAt: timestamp("expire_at").notNull(),
});
