import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "purchases" WHERE "document_id" IS NOT NULL;
   ALTER TABLE "purchases" DROP CONSTRAINT "purchases_document_id_documents_id_fk";
  
  DROP INDEX "purchases_document_idx";
  ALTER TABLE "purchases" ADD COLUMN "resource_id" integer NOT NULL;
  ALTER TABLE "purchases" ADD CONSTRAINT "purchases_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "purchases_resource_idx" ON "purchases" USING btree ("resource_id");
  ALTER TABLE "purchases" DROP COLUMN "document_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "purchases" DROP CONSTRAINT "purchases_resource_id_resources_id_fk";
  
  DROP INDEX "purchases_resource_idx";
  ALTER TABLE "purchases" ADD COLUMN "document_id" integer NOT NULL;
  ALTER TABLE "purchases" ADD CONSTRAINT "purchases_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "purchases_document_idx" ON "purchases" USING btree ("document_id");
  ALTER TABLE "purchases" DROP COLUMN "resource_id";`)
}
