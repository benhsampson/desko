import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import withApollo from '../lib/utils/withApollo';
import { LoginIn, useLoginMutation, UserError } from '../__generated__/graphql';
import { useAuthenticate } from '../lib/utils/useAuthenticate';
import { useQueryVar } from '../lib/utils/useQueryVar';
import ErrorList from '../components/ErrorList';
import { partitionErrors } from '../lib/utils/partitionErrors';
import AuthLayout from '../components/AuthLayout';
import Link from '../components/Link';
import {
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material';
import PasswordTextField from '../components/PasswordTextField';

interface LoginFormIn extends LoginIn {
  remember: boolean;
}

function LoginPage() {
  const [login, { loading }] = useLoginMutation();
  const authenticate = useAuthenticate();

  const code = useQueryVar('code');

  const { register, handleSubmit, setError, formState } =
    useForm<LoginFormIn>();
  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const onSubmit: SubmitHandler<LoginFormIn> = async (input) => {
    const { errors, data } = await login({
      variables: { email: input.email, password: input.password },
    });

    if (errors) return console.error(errors);

    if (data?.login.errors) {
      partitionErrors(
        data.login.errors,
        (err) =>
          setError(err.path as keyof LoginIn, {
            type: 'server',
            message: err.message,
          }),
        (errs) => setGenericErrors(errs)
      );
    }

    if (data?.login.accessToken && data.login.accessTokenExpiry) {
      await authenticate(
        data.login.accessToken,
        new Date(data.login.accessTokenExpiry as string),
        code && `/invite/${code}`
      );
    }
  };

  const isUser = !!code;

  return (
    <AuthLayout
      mainHeading={isUser ? 'Log in to proceed.' : 'Sign in to desko.io.'}
      subHeading={
        isUser
          ? 'Enter your details below to start booking desks.'
          : 'Enter your details below.'
      }
      headerContent={
        <>
          Are you managing a space?&nbsp;
          <Link
            href={{ pathname: '/register', ...(code && { query: { code } }) }}
          >
            Get started
          </Link>
        </>
      }
    >
      <ErrorList errors={genericErrors} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
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
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ my: 2 }}
          >
            <FormControlLabel
              control={<Checkbox {...register('remember')} />}
              label="Remember me"
            />
            <Link variant="subtitle2" href="/forgot-password">
              Forgot password?
            </Link>
          </Stack>
          <Button
            disabled={loading}
            type="submit"
            size="large"
            variant="contained"
          >
            Log In
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}

export default withApollo(LoginPage);
