import { Button, IconButton, Snackbar, Stack } from '@mui/material';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import AuthLayout from '../components/AuthLayout';
import ErrorList from '../components/ErrorList';
import PasswordTextField from '../components/PasswordTextField';
import { partitionErrors } from '../lib/utils/partitionErrors';
import useSnackbar from '../lib/utils/useSnackbar';
import withApollo from '../lib/utils/withApollo';
import {
  ChangePasswordIn,
  useChangePasswordMutation,
  UserError,
} from '../__generated__/graphql';
import { NextLinkComposed } from '../components/Link';

function ChangePasswordPage() {
  const [changePassword, { loading }] = useChangePasswordMutation();
  const { register, handleSubmit, setError, formState } =
    useForm<ChangePasswordIn>();

  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const sb = useSnackbar();

  const onSubmit: SubmitHandler<ChangePasswordIn> = async (input) => {
    const { errors, data } = await changePassword({ variables: input });

    if (errors) return console.error(errors);

    if (data?.changePassword.errors) {
      return partitionErrors(
        data.changePassword.errors,
        (err) =>
          setError(err.path as keyof ChangePasswordIn, {
            type: 'server',
            message: err.message,
          }),
        (errs) => setGenericErrors(errs)
      );
    }

    setGenericErrors([]);
    sb.handleOpen();
  };

  return (
    <AuthLayout
      mainHeading="Set a new password."
      subHeading="Enter your new password below."
    >
      <Snackbar
        open={sb.isOpen}
        onClose={sb.handleClose}
        message="Password changed! "
        autoHideDuration={5000}
        action={
          <Button
            component={NextLinkComposed}
            to="/spaces"
            size="small"
            color="inherit"
            onClick={sb.handleClose}
            startIcon={<ArrowForwardIcon />}
          >
            Go to dashboard
          </Button>
        }
      />
      <ErrorList errors={genericErrors} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <PasswordTextField
            label="Old password"
            fullWidth
            error={!!formState.errors.oldPassword}
            helperText={formState.errors.oldPassword?.message}
            {...register('oldPassword', { required: true })}
          />
          <PasswordTextField
            label="New password"
            fullWidth
            error={!!formState.errors.newPassword}
            helperText={formState.errors.newPassword?.message}
            {...register('newPassword', { required: true })}
          />
          <PasswordTextField
            label="Confirm new password"
            fullWidth
            error={!!formState.errors.newPasswordConfirm}
            helperText={formState.errors.newPasswordConfirm?.message}
            {...register('newPasswordConfirm', { required: true })}
          />
          <Button
            disabled={loading}
            type="submit"
            size="large"
            variant="contained"
          >
            Change Password
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}

export default withApollo(ChangePasswordPage);
