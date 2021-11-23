import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Navbar from '../components/Navbar';
import { partition } from '../lib/utils/partition';
import withApollo from '../lib/utils/withApollo';
import {
  ChangePasswordIn,
  useChangePasswordMutation,
} from '../__generated__/graphql';

function ChangePasswordPage() {
  const [changePassword] = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordIn>();

  const [genericErrors, setGenericErrors] = useState<string[]>([]);

  const onSubmit: SubmitHandler<ChangePasswordIn> = async (input) => {
    const { errors, data } = await changePassword({ variables: input });

    if (errors) {
      return setGenericErrors(errors.map((e) => e.message));
    }

    if (data?.changePassword.errors) {
      const [pathErrors, nonPathErrors] = partition(
        data.changePassword.errors,
        (err) => !!err.path
      );
      pathErrors.forEach(({ path, message }) =>
        setError(path as keyof ChangePasswordIn, { type: 'server', message })
      );
      return setGenericErrors(nonPathErrors.map(({ message }) => message));
    }

    setGenericErrors([]);
  };

  return (
    <Navbar>
      <form onSubmit={handleSubmit(onSubmit)}>
        {genericErrors.length ? (
          <ul>
            {genericErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
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
