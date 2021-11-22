import { MigrationInterface, QueryRunner } from 'typeorm';

import { ROLES } from '../constants';
import { Role } from '../entities/role.entity';

export class Init1637537512558 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values(ROLES)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from(Role)
      .where('id IN (:ids)', { ids: ROLES.map(({ id }) => id) })
      .execute();
  }
}
