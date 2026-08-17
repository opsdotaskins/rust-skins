ALTER TABLE "items" ALTER COLUMN "slug" SET DATA TYPE varchar(200);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "market_hash_name" varchar(220);--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "color" varchar(16);--> statement-breakpoint
ALTER TABLE "items" ADD COLUMN "stock" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "market_hash_name" varchar(220);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "sih_order_id" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "sih_status" varchar(24);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "sih_error" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "steam_id" varchar(32);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "sih_status" varchar(24);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "steam_id" varchar(32);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "steam_name" varchar(120);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "steam_avatar" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "steam_trade_token" varchar(32);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "items_mhn_idx" ON "items" USING btree ("market_hash_name");