import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAuditLogsTable1782700000000 implements MigrationInterface {
  name = 'CreateAuditLogsTable1782700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'integer', isNullable: true },
          { name: 'username', type: 'varchar', length: '255', isNullable: true },
          { name: 'role', type: 'varchar', length: '64', isNullable: true },
          { name: 'action', type: 'varchar', length: '64', isNullable: false },
          { name: 'method', type: 'varchar', length: '16', isNullable: false },
          { name: 'path', type: 'varchar', length: '512', isNullable: false },
          { name: 'resource', type: 'varchar', length: '128', isNullable: true },
          { name: 'resource_id', type: 'integer', isNullable: true },
          { name: 'status_code', type: 'integer', isNullable: false },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'ip', type: 'varchar', length: '64', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({ name: 'idx_audit_logs_user_id', columnNames: ['user_id'] }),
    );
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({ name: 'idx_audit_logs_action', columnNames: ['action'] }),
    );
    await queryRunner.createIndex(
      'audit_logs',
      new TableIndex({ name: 'idx_audit_logs_created_at', columnNames: ['created_at'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs', true);
  }
}
