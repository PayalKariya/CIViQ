ALTER TABLE `complaints` ADD `domain` text DEFAULT 'civic';--> statement-breakpoint
ALTER TABLE `complaints` ADD `department` text DEFAULT 'civic_roads';--> statement-breakpoint
ALTER TABLE `complaints` ADD `issue_type` text DEFAULT 'potholes';
