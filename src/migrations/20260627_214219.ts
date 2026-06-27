import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_folders_folder_type" ADD VALUE 'documents' BEFORE 'media';
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  ALTER TABLE "resources" ADD COLUMN "document_id" integer;
  ALTER TABLE "_resources_v" ADD COLUMN "version_document_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "documents_id" integer;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "documents_folder_idx" ON "documents" USING btree ("folder_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  ALTER TABLE "resources" ADD CONSTRAINT "resources_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_resources_v" ADD CONSTRAINT "_resources_v_version_document_id_documents_id_fk" FOREIGN KEY ("version_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "resources_document_idx" ON "resources" USING btree ("document_id");
  CREATE INDEX "_resources_v_version_version_document_idx" ON "_resources_v" USING btree ("version_document_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "documents" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "documents" CASCADE;
  ALTER TABLE "resources" DROP CONSTRAINT "resources_document_id_documents_id_fk";
  
  ALTER TABLE "_resources_v" DROP CONSTRAINT "_resources_v_version_document_id_documents_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_documents_fk";
  
  ALTER TABLE "payload_folders_folder_type" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_folders_folder_type";
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  ALTER TABLE "payload_folders_folder_type" ALTER COLUMN "value" SET DATA TYPE "public"."enum_payload_folders_folder_type" USING "value"::"public"."enum_payload_folders_folder_type";
  DROP INDEX "resources_document_idx";
  DROP INDEX "_resources_v_version_version_document_idx";
  DROP INDEX "payload_locked_documents_rels_documents_id_idx";
  ALTER TABLE "resources" DROP COLUMN "document_id";
  ALTER TABLE "_resources_v" DROP COLUMN "version_document_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "documents_id";`)
}
