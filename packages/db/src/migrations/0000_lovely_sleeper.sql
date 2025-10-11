CREATE TYPE "public"."diagram_type" AS ENUM('activity', 'sequence', 'class', 'state');--> statement-breakpoint
CREATE TYPE "public"."node_type" AS ENUM('databaseSchema');--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"name" varchar(100),
	"password_hash" varchar(255),
	"refresh_token" varchar(500),
	"is_verified" boolean DEFAULT false,
	"picture" varchar(500),
	"create_at" timestamp DEFAULT now(),
	"update_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"role_name" varchar(50),
	"role_desc" varchar(255),
	"enabled" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "operator_roles" (
	"user_id" bigint,
	"role_id" bigint,
	CONSTRAINT "operator_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(50),
	"description" varchar(255),
	"public" boolean DEFAULT false,
	"owner_id" bigint
);
--> statement-breakpoint
CREATE TABLE "prj_roles" (
	"project_id" bigint,
	"role_id" bigint,
	CONSTRAINT "prj_roles_project_id_role_id_pk" PRIMARY KEY("project_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "canvases" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"prj_id" bigint
);
--> statement-breakpoint
CREATE TABLE "erd_canvases" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"prj_id" bigint
);
--> statement-breakpoint
CREATE TABLE "erd_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prj_id" bigint,
	"logical_name" varchar(50),
	"physical_name" varchar(50),
	"label" varchar(30),
	"position" jsonb,
	"type" "node_type"
);
--> statement-breakpoint
CREATE TABLE "node_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid,
	"prj_id" bigint,
	"index" integer,
	"logical_name" varchar(50),
	"physical_name" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "diagram_posts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"type" "diagram_type",
	"user_id" bigint,
	"canvas_id" bigint
);
--> statement-breakpoint
ALTER TABLE "operator_roles" ADD CONSTRAINT "operator_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator_roles" ADD CONSTRAINT "operator_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prj_roles" ADD CONSTRAINT "prj_roles_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prj_roles" ADD CONSTRAINT "prj_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canvases" ADD CONSTRAINT "canvases_prj_id_projects_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erd_canvases" ADD CONSTRAINT "erd_canvases_prj_id_projects_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erd_nodes" ADD CONSTRAINT "erd_nodes_prj_id_erd_canvases_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."erd_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_fields" ADD CONSTRAINT "node_fields_node_id_erd_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."erd_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_fields" ADD CONSTRAINT "node_fields_prj_id_erd_canvases_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."erd_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagram_posts" ADD CONSTRAINT "diagram_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagram_posts" ADD CONSTRAINT "diagram_posts_canvas_id_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."canvases"("id") ON DELETE cascade ON UPDATE no action;
