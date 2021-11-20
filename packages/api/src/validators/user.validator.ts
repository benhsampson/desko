import * as yup from 'yup';
import { ChangePasswordIn, LoginIn, RegisterIn } from '../types/user.type';

const passwordSchema = yup
  .string()
  .min(8, 'Password to short - needs to be 8 characters minimum')
  .matches(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).*$/,
    'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
  );

export const registerSchema: yup.SchemaOf<RegisterIn> = yup.object().shape({
  fullName: yup.string().required(),
  email: yup.string().email('Invalid email').required(),
  password: passwordSchema.required(),
});

export const loginSchema: yup.SchemaOf<LoginIn> = yup.object().shape({
  email: yup.string().required(),
  password: yup.string().required(),
});

export const changePasswordSchema: yup.SchemaOf<ChangePasswordIn> = yup
  .object()
  .shape({
    newPassword: passwordSchema.required(),
    newPasswordConfirm: yup
      .string()
      .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
      .required(),
  });
