import 'reflect-metadata';
import { Field, ObjectType, Query, Resolver } from 'type-graphql';

@ObjectType()
class StatusResponse {
  @Field()
  alive!: boolean;
}

@Resolver()
export class StatusResolver {
  @Query(() => StatusResponse)
  getStatus(): StatusResponse {
    return {
      alive: true,
    };
  }
}
