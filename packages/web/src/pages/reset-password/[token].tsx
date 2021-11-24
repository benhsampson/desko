import { useRouter } from 'next/router';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import ErrorList from '../../components/ErrorList';
import { partitionErrors } from '../../lib/utils/partitionErrors';
import withApollo from '../../lib/utils/withApollo';
import {
  ResetPasswordIn,
  UserError,
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
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ErrorList errors={genericErrors} />
        <input {...register('password')} />
        {errors.password?.message}
        <button type="submit">reset password</button>
      </form>
    </div>
  );
}

export default withApollo(ResetPasswordPage);
