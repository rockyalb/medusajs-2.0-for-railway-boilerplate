import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260526145500 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "loyalty_reward_setting" ("id" text not null, "key" text not null, "percentage" integer not null default 2, "is_enabled" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_reward_setting_pkey" primary key ("id"));'
    )
    this.addSql(
      'CREATE INDEX IF NOT EXISTS "IDX_loyalty_reward_setting_deleted_at" ON "loyalty_reward_setting" (deleted_at) WHERE deleted_at IS NULL;'
    )
    this.addSql(
      'CREATE UNIQUE INDEX IF NOT EXISTS "IDX_loyalty_reward_setting_key_unique" ON "loyalty_reward_setting" ("key") WHERE deleted_at IS NULL;'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "loyalty_reward_setting" cascade;')
  }
}
