import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Stack, TextField, Typography } from '@mui/material';

import withApollo from '../lib/utils/withApollo';
import {
  RegisterIn,
  useRegisterMutation,
  UserError,
} from '../__generated__/graphql';
import { useAuthenticate } from '../lib/utils/useAuthenticate';
import { useQueryVar } from '../lib/utils/useQueryVar';
import { partitionErrors } from '../lib/utils/partitionErrors';
import ErrorList from '../components/ErrorList';
import AuthLayout from '../components/AuthLayout';
import Link from '../components/Link';
import PasswordTextField from '../components/PasswordTextField';

function RegisterPage() {
  const [registerUser, { loading }] = useRegisterMutation();
  const authenticate = useAuthenticate();

  const code = useQueryVar('code');

  const { register, handleSubmit, setError, formState } = useForm<RegisterIn>({
    defaultValues: { role: code ? 'USER' : 'MANAGER' },
  });
  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const onSubmit: SubmitHandler<RegisterIn> = async (input) => {
    const { errors, data } = await registerUser({ variables: input });

    if (errors) return console.error(errors);

    if (data?.register.errors) {
      partitionErrors(
        data.register.errors,
        (err) =>
          setError(err.path as keyof RegisterIn, {
            type: 'server',
            message: err.message,
          }),
        (errs) => setGenericErrors(errs)
      );
    }

    if (data?.register.accessToken && data.register.accessTokenExpiry) {
      await authenticate(
        data.register.accessToken,
        new Date(data.register.accessTokenExpiry as string),
        code && `/invite/${code}`
      );
    }
  };

  const isUser = !!code;

  return (
    <AuthLayout
      mainHeading={
        isUser
          ? 'Get started to proceed.'
          : 'Start managing your space for free.'
      }
      subHeading={
        isUser
          ? 'Create an account to start booking desks.'
          : 'No credit card needed.'
      }
      headerContent={
        <>
          Already have an account?&nbsp;
          <Link href={{ pathname: '/login', ...(code && { query: { code } }) }}>
            Login
          </Link>
        </>
      }
    >
      <ErrorList errors={genericErrors} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <TextField
            label="Name"
            error={!!formState.errors.fullName}
            helperText={formState.errors.fullName?.message}
            fullWidth
            {...register('fullName', { required: true })}
          />
          <TextField
            label="Email address"
            fullWidth
            error={!!formState.errors.email}
            helperText={formState.errors.email?.message}
            {...register('email', { required: true })}
          />
          <PasswordTextField
            label="Password"
            fullWidth
            error={!!formState.errors.password}
            helperText={formState.errors.password?.message}
            {...register('password', { required: true })}
          />
          <Button
            disabled={loading}
            type="submit"
            size="large"
            variant="contained"
          >
            Register
          </Button>
        </Stack>
      </form>
      <Typography
        variant="body2"
        align="center"
        sx={{ color: 'text.secondary', mt: 3 }}
      >
        By registering, I agree to the desko.io&nbsp;
        <Link href="/terms">Terms of Use</Link>
        &nbsp;and&nbsp;
        <Link href="/privacy">Privacy Policy</Link>.
      </Typography>
    </AuthLayout>
  );
}

export default withApollo(RegisterPage);
