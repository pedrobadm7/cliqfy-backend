import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRefreshTokenOnly1759579672494 implements MigrationInterface {
  name = 'RemoveRefreshTokenOnly1759579672494';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshToken"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "refreshToken" text`);
  }
}
