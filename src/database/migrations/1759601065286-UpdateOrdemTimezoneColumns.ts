import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOrdemTimezoneColumns1234567890123
  implements MigrationInterface
{
  name = 'UpdateOrdemTimezoneColumns1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "data_criacao" TYPE timestamp with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "data_atualizacao" TYPE timestamp with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "data_conclusao" TYPE timestamp with time zone`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "data_criacao" TYPE timestamp`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "data_atualizacao" TYPE timestamp`,
    );
    await queryRunner.query(
      `ALTER TABLE "ordem" ALTER COLUMN "data_conclusao" TYPE timestamp`,
    );
  }
}
