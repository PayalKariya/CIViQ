DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `complaints` ALTER COLUMN "domain" TO "domain" text DEFAULT 'civic';--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `complaints` ALTER COLUMN "department" TO "department" text DEFAULT 'civic_roads';--> statement-breakpoint
ALTER TABLE `complaints` ALTER COLUMN "issue_type" TO "issue_type" text DEFAULT 'potholes';--> statement-breakpoint
ALTER TABLE `users` ADD `issue_type` text;