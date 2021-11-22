import { EntityRepository, Repository } from 'typeorm';

import { Role, RoleValue } from '../entities/role.entity';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createAndSave(
    fullName: string,
    email: string,
    hashedPassword: string,
    roleValue: RoleValue
  ) {
    const user = new User();

    user.fullName = fullName;
    user.email = email;
    user.password = hashedPassword;

    const role = await this.manager.findOneOrFail(Role, {
      where: { value: roleValue },
    });

    user.roles = [role];

    return this.manager.save(user);
  }

  findByEmail(email: string) {
    return this.manager.findOne(User, { where: { email } });
  }

  updatePasswordAndSave(user: User, hashedPassword: string) {
    user.password = hashedPassword;
    return this.manager.save(user);
  }
}
