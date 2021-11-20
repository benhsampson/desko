import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
