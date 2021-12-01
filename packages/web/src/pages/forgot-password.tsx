import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import AuthLayout from '../components/AuthLayout';

import ErrorList from '../components/ErrorList';
import { partitionErrors } from '../lib/utils/partitionErrors';
import withApollo from '../lib/utils/withApollo';
import {
  ForgotPasswordIn,
  useForgotPasswordMutation,
  UserError,
} from '../__generated__/graphql';
import Link from '../components/Link';
import { Button, Snackbar, Stack, TextField } from '@mui/material';

function ForgotPasswordPage() {
  const [forgotPassword, { loading }] = useForgotPasswordMutation();
  const { register, handleSubmit, setError, formState } =
    useForm<ForgotPasswordIn>();

  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const [snackbar, setSnackbar] = useState<string | null>(null);

  const handleCloseSnackbar = (
    _: Event | React.SyntheticEvent,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;

    setSnackbar(null);
  };

  const onSubmit: SubmitHandler<ForgotPasswordIn> = async (input) => {
    const { errors, data } = await forgotPassword({ variables: input });

    if (errors) return console.error(errors);

    if (data?.forgotPassword.errors) {
      return partitionErrors(
        data.forgotPassword.errors,
        (err) =>
          setError(err.path as keyof ForgotPasswordIn, {
            type: 'server',
            message: err.message,
          }),
        (errs) => setGenericErrors(errs)
      );
    }

    setGenericErrors([]);

    setSnackbar('Reset link sent! Check your inbox.');
  };

  return (
    <AuthLayout
      mainHeading="Recover your password."
      subHeading="Enter the email address associated with your account and we'll send you a link to reset your password."
      headerContent={
        <>
          Remember it?&nbsp;
          <Link href={{ pathname: '/login' }}>Login</Link>
        </>
      }
    >
      <Snackbar
        open={!!snackbar}
        onClose={handleCloseSnackbar}
        autoHideDuration={6000}
        message={snackbar}
      />
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
          <Button
            disabled={loading}
            type="submit"
            size="large"
            variant="contained"
          >
            Request reset link
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}

export default withApollo(ForgotPasswordPage);
