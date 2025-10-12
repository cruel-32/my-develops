ALTER TABLE "prj_roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "prj_roles" CASCADE;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "project_id" bigint;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;