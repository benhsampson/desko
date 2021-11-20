import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  createAndSave(fullName: string, email: string, hashedPassword: string) {
    const user = new User();
    user.fullName = fullName;
    user.email = email;
    user.password = hashedPassword;
    return this.manager.save(user);
  }

  findByEmail(email: string) {
    return this.manager.findOne(User, { where: { email } });
  }

  async updatePasswordAndSave(userId: string, hashedPassword: string) {
    const user = await this.findOneOrFail(userId);
    user.password = hashedPassword;
    return this.manager.save(user);
  }
}
