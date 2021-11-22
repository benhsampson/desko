import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export type RoleValue = 'USER' | 'MANAGER';

@Entity()
@ObjectType()
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @Field(() => String)
  value!: RoleValue;

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];
}
