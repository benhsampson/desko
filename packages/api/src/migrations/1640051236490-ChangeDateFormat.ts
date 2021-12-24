import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeDateFormat1640051236490 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE booking ADD COLUMN date date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE booking MODIFY COLUMN date timestamp`);
  }
}
