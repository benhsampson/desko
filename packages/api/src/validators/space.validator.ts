import * as yup from 'yup';
import { CreateSpaceIn } from '../types/space.type';

export const createSpaceSchema: yup.SchemaOf<CreateSpaceIn> = yup
  .object()
  .shape({
    name: yup.string().required(),
    maxBookingsPerDay: yup.number().integer().required(),
  });
