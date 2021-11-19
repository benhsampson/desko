import * as yup from 'yup';
import { RegisterIn } from '../resolvers/user.resolver';

export const registerSchema: yup.SchemaOf<RegisterIn> = yup.object().shape({
  fullName: yup.string().required(),
  email: yup.string().email('Invalid email').required(),
  password: yup
    .string()
    .min(8, 'Password to short - needs to be 8 characters minimum')
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).*$/,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
    )
    .required(),
});
