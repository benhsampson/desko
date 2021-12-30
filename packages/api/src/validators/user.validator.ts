import * as yup from 'yup';
import { ChangePasswordIn, LoginIn, ResetPasswordIn } from '../types/user.type';

const passwordSchema = yup
  .string()
  .min(8, 'Password to short - needs to be 8 characters minimum')
  .matches(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).*$/,
    'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number'
  );

export const registerSchema = yup
  .object({
    fullName: yup.string().defined(),
    email: yup.string().email('Invalid email').defined(),
    password: passwordSchema.defined(),
    role: yup.string().defined(),
  })
  .defined();

export const loginSchema: yup.SchemaOf<LoginIn> = yup
  .object({
    email: yup.string().defined(),
    password: yup.string().defined(),
  })
  .defined();

export const changePasswordSchema: yup.SchemaOf<ChangePasswordIn> = yup
  .object({
    oldPassword: yup.string().defined(),
    newPassword: passwordSchema.defined(),
    newPasswordConfirm: yup
      .string()
      .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
      .defined(),
  })
  .defined();

export const resetPasswordSchema: yup.SchemaOf<ResetPasswordIn> = yup
  .object({
    password: passwordSchema.defined(),
  })
  .defined();
