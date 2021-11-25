import * as yup from 'yup';
import { CreateSpaceIn, UpdateSpaceIn } from '../types/space.type';

const nameSchema = yup.string().min(1);
const maxBookingsPerDaySchema = yup.number().integer();

export const createSpaceSchema: yup.SchemaOf<CreateSpaceIn> = yup
  .object({
    name: nameSchema.defined(),
    maxBookingsPerDay: maxBookingsPerDaySchema.defined(),
  })
  .defined();

export const updateSpaceSchema: yup.SchemaOf<UpdateSpaceIn> = yup
  .object({
    name: nameSchema,
    maxBookingsPerDay: maxBookingsPerDaySchema,
  })
  .defined();
