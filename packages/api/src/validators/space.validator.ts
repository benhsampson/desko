import * as yup from 'yup';
import { CreateSpaceIn, UpdateSpaceIn } from '../types/space.type';

export const createSpaceSchema: yup.SchemaOf<CreateSpaceIn> = yup
  .object({
    name: yup.string().defined(),
    maxBookingsPerDay: yup.number().integer().defined(),
  })
  .defined();

export const updateSpaceSchema: yup.SchemaOf<UpdateSpaceIn> = yup
  .object({
    name: yup.string(),
    maxBookingsPerDay: yup.number().integer(),
  })
  .defined();
