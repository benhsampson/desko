import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type RoleValue = 'USER' | 'MANAGER';

@Entity()
@ObjectType()
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @Field(() => String)
  value!: RoleValue;
}
