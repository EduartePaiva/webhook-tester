CREATE TABLE IF NOT EXISTS "reset_password" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"expire_at" timestamp NOT NULL
);
--> statement-breakpoint

ALTER TABLE "reset_password" ADD CONSTRAINT "reset_password_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;

