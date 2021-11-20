import { useRouter } from 'next/router';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { partition } from '../../lib/utils/partition';
import withApollo from '../../lib/utils/withApollo';
import {
  ResetPasswordIn,
  useResetPasswordMutation,
} from '../../__generated__/graphql';

function ResetPasswordPage() {
  const router = useRouter();

  const [resetPassword] = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordIn>();

  const [genericErrors, setGenericErrors] = useState<string[]>([]);

  const onSubmit: SubmitHandler<ResetPasswordIn> = async (input) => {
    const { token } = router.query;

    if (!token || typeof token !== 'string') return;

    const { errors, data } = await resetPassword({
      variables: { token, ...input },
    });

    if (errors) {
      return setGenericErrors(errors.map((e) => e.message));
    }

    if (data?.resetPassword.errors) {
      const [pathErrors, nonPathErrors] = partition(
        data.resetPassword.errors,
        (err) => !!err.path
      );
      pathErrors.forEach(({ path, message }) =>
        setError(path as keyof ResetPasswordIn, { type: 'server', message })
      );
      return setGenericErrors(nonPathErrors.map(({ message }) => message));
    }

    setGenericErrors([]);

    await router.push('/login');
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {genericErrors.length ? (
          <ul>
            {genericErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        <input {...register('password')} />
        {errors.password?.message}
        <button type="submit">reset password</button>
      </form>
    </div>
  );
}

export default withApollo(ResetPasswordPage);
