import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 100)
      table.date('from')
      table.date('to')
      table.string('location')
      table.string('description')
      table
        .integer('created_by_id')
        .nullable()
        .index()
        .unsigned()
        .references('id')
        .inTable('faculty')
      table.enum('status', ['approved', 'unapproved'])
      table.timestamp('deleted_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
