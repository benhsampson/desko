import { Field, ObjectType } from 'type-graphql';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Space } from './space.entity';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id!: string;

  @Column()
  @Field()
  fullName!: string;

  @Column({ unique: true })
  @Field()
  email!: string;

  @Column()
  @Field()
  password!: string;

  @ManyToMany(() => Role)
  @JoinTable()
  @Field(() => [Role])
  roles!: Role[];

  @OneToMany(() => Space, (space) => space.user)
  @Field(() => [Space])
  spaces!: Space[];
}
