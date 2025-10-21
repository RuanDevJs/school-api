import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("student_homework", (tableBuilder) => {
    tableBuilder.uuid("id").unique().notNullable();
    tableBuilder.uuid("student_id").notNullable();
    tableBuilder.foreign("student_id").references("students.id");
    tableBuilder.uuid("homework_id").notNullable();
    tableBuilder.foreign("homework_id").references("homework.id");
    tableBuilder.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("student_homework");
}

