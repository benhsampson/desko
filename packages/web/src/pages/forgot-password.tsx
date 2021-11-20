import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { partition } from '../lib/utils/partition';
import withApollo from '../lib/utils/withApollo';
import {
  ForgotPasswordIn,
  useForgotPasswordMutation,
} from '../__generated__/graphql';

function ForgotPasswordPage() {
  const [forgotPassword] = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordIn>();

  const [genericErrors, setGenericErrors] = useState<string[]>([]);

  const onSubmit: SubmitHandler<ForgotPasswordIn> = async (input) => {
    const { errors, data } = await forgotPassword({ variables: input });

    if (errors) {
      return setGenericErrors(errors.map((e) => e.message));
    }

    if (data?.forgotPassword.errors) {
      const [pathErrors, nonPathErrors] = partition(
        data.forgotPassword.errors,
        (err) => !!err.path
      );
      pathErrors.forEach(({ path, message }) =>
        setError(path as keyof ForgotPasswordIn, { type: 'server', message })
      );
      return setGenericErrors(nonPathErrors.map(({ message }) => message));
    }

    setGenericErrors([]);
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
        <input {...register('email')} />
        {errors.email?.message}
        <button type="submit">send reset email</button>
      </form>
    </div>
  );
}

export default withApollo(ForgotPasswordPage);
