import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260526152000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table if exists "loyalty_reward_setting" add column if not exists "start_date" timestamptz null, add column if not exists "end_date" timestamptz null;'
    )
  }

  async down(): Promise<void> {
    this.addSql(
      'alter table if exists "loyalty_reward_setting" drop column if exists "start_date", drop column if exists "end_date";'
    )
  }
}
