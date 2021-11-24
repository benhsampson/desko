import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import ErrorList from '../components/ErrorList';
import Navbar from '../components/Navbar';
import { partitionErrors } from '../lib/utils/partitionErrors';
import withApollo from '../lib/utils/withApollo';
import {
  ChangePasswordIn,
  useChangePasswordMutation,
  UserError,
} from '../__generated__/graphql';

function ChangePasswordPage() {
  const [changePassword] = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordIn>();

  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const onSubmit: SubmitHandler<ChangePasswordIn> = async (input) => {
    const { errors, data } = await changePassword({ variables: input });

    if (errors) return console.error(errors);

    if (data?.changePassword.errors) {
      partitionErrors(
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
  };

  return (
    <Navbar>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ErrorList errors={genericErrors} />
        <input {...register('newPassword')} placeholder="new password" />
        {errors.newPassword?.message}
        <input
          {...register('newPasswordConfirm')}
          placeholder="confirm new password"
        />
        {errors.newPasswordConfirm?.message}
        <button type="submit">change password</button>
      </form>
    </Navbar>
  );
}

export default withApollo(ChangePasswordPage);
