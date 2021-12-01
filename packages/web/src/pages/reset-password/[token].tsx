import { Button, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import AuthLayout from '../../components/AuthLayout';

import ErrorList from '../../components/ErrorList';
import PasswordTextField from '../../components/PasswordTextField';
import { partitionErrors } from '../../lib/utils/partitionErrors';
import withApollo from '../../lib/utils/withApollo';
import {
  ResetPasswordIn,
  UserError,
  useResetPasswordMutation,
} from '../../__generated__/graphql';

function ResetPasswordPage() {
  const router = useRouter();

  const [resetPassword, { loading }] = useResetPasswordMutation();
  const { register, handleSubmit, setError, formState } =
    useForm<ResetPasswordIn>();

  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const onSubmit: SubmitHandler<ResetPasswordIn> = async (input) => {
    const { token } = router.query;

    if (!token || typeof token !== 'string') return;

    const { errors, data } = await resetPassword({
      variables: { token, ...input },
    });

    if (errors) return console.error(errors);

    if (data?.resetPassword.errors) {
      partitionErrors(
        data.resetPassword.errors,
        (err) =>
          setError(err.path as keyof ResetPasswordIn, {
            type: 'server',
            message: err.message,
          }),
        (errs) => setGenericErrors(errs)
      );
    }

    await router.push('/login');
  };

  return (
    <AuthLayout
      mainHeading="Reset your password."
      subHeading="Enter your new password below."
    >
      <ErrorList errors={genericErrors} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <PasswordTextField
            label="New password"
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
            Reset password
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}

export default withApollo(ResetPasswordPage);
