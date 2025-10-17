CREATE TYPE "public"."diagram_type" AS ENUM('activity', 'sequence', 'class', 'state');--> statement-breakpoint
CREATE TYPE "public"."node_type" AS ENUM('databaseSchema');--> statement-breakpoint
CREATE TYPE "public"."role_type" AS ENUM('super_admin', 'admin', 'user', 'prj_admin', 'prj_write', 'prj_read');--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"refresh_token" varchar(500),
	"is_verified" boolean DEFAULT false NOT NULL,
	"picture" varchar(500),
	"create_at" timestamp DEFAULT now() NOT NULL,
	"update_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"role_name" "role_type" NOT NULL,
	"role_desc" varchar(255) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"prj_id" bigint
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
	"name" varchar(50) NOT NULL,
	"description" varchar(255) NOT NULL,
	"public" boolean DEFAULT true NOT NULL,
	"owner_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canvases" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"prj_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erd_canvases" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"prj_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "erd_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prj_id" bigint NOT NULL,
	"logical_name" varchar(50) NOT NULL,
	"physical_name" varchar(50) NOT NULL,
	"label" varchar(30) NOT NULL,
	"position" jsonb,
	"type" "node_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "node_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"node_id" uuid NOT NULL,
	"prj_id" bigint NOT NULL,
	"index" integer NOT NULL,
	"logical_name" varchar(50) NOT NULL,
	"physical_name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagram_posts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"type" "diagram_type" NOT NULL,
	"user_id" bigint NOT NULL,
	"canvas_id" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prj_id" bigint,
	"img_url" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_prj_id_projects_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator_roles" ADD CONSTRAINT "operator_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operator_roles" ADD CONSTRAINT "operator_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canvases" ADD CONSTRAINT "canvases_prj_id_projects_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erd_canvases" ADD CONSTRAINT "erd_canvases_prj_id_projects_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erd_nodes" ADD CONSTRAINT "erd_nodes_prj_id_erd_canvases_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."erd_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_fields" ADD CONSTRAINT "node_fields_node_id_erd_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."erd_nodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "node_fields" ADD CONSTRAINT "node_fields_prj_id_erd_canvases_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."erd_canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagram_posts" ADD CONSTRAINT "diagram_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagram_posts" ADD CONSTRAINT "diagram_posts_canvas_id_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "images" ADD CONSTRAINT "images_prj_id_projects_id_fk" FOREIGN KEY ("prj_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;