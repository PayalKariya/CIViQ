ALTER TABLE `complaints` ADD `escalation_level` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `complaints` ADD `escalation_deadline` text;--> statement-breakpoint
ALTER TABLE `users` ADD `domain` text;--> statement-breakpoint
ALTER TABLE `users` ADD `authority_level` integer;--> statement-breakpoint
ALTER TABLE `users` ADD `employee_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `designation` text;--> statement-breakpoint
ALTER TABLE `users` ADD `verification_status` text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `users` ADD `verification_doc_url` text;