CREATE TABLE IF NOT EXISTS "payment_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference_id" varchar(100) NOT NULL,
	"corefy_invoice_id" varchar(100),
	"user_id" integer,
	"type" varchar(40) DEFAULT 'checkout' NOT NULL,
	"order_id" integer,
	"amount_minor" integer DEFAULT 0 NOT NULL,
	"pay_amount" varchar(20) NOT NULL,
	"pay_currency" varchar(10) DEFAULT 'EUR' NOT NULL,
	"status" varchar(40) DEFAULT 'pending' NOT NULL,
	"resolution" varchar(80),
	"hpp_url" text,
	"customer_email" varchar(255),
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "payment_invoices_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payment_invoices_ref_idx" ON "payment_invoices" USING btree ("reference_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_invoices_corefy_idx" ON "payment_invoices" USING btree ("corefy_invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_invoices_user_idx" ON "payment_invoices" USING btree ("user_id");
