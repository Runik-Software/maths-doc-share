import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "stripe_i_d" varchar;
  ALTER TABLE "users" ADD COLUMN "skip_sync" boolean;
  ALTER TABLE "resources" ADD COLUMN "stripe_product_id" varchar;
  ALTER TABLE "resources" ADD COLUMN "stripe_price_id" varchar;
  ALTER TABLE "_resources_v" ADD COLUMN "version_stripe_product_id" varchar;
  ALTER TABLE "_resources_v" ADD COLUMN "version_stripe_price_id" varchar;
  ALTER TABLE "purchases" ADD COLUMN "stripe_checkout_session_id" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "stripe_i_d";
  ALTER TABLE "users" DROP COLUMN "skip_sync";
  ALTER TABLE "resources" DROP COLUMN "stripe_product_id";
  ALTER TABLE "resources" DROP COLUMN "stripe_price_id";
  ALTER TABLE "_resources_v" DROP COLUMN "version_stripe_product_id";
  ALTER TABLE "_resources_v" DROP COLUMN "version_stripe_price_id";
  ALTER TABLE "purchases" DROP COLUMN "stripe_checkout_session_id";`)
}
