import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import ErrorList from '../components/ErrorList';
import Navbar from '../components/Navbar';
import { partitionErrors } from '../lib/utils/partitionErrors';
import withApollo from '../lib/utils/withApollo';
import {
  ForgotPasswordIn,
  useForgotPasswordMutation,
  UserError,
} from '../__generated__/graphql';

function ForgotPasswordPage() {
  const [forgotPassword] = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordIn>();

  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const onSubmit: SubmitHandler<ForgotPasswordIn> = async (input) => {
    const { errors, data } = await forgotPassword({ variables: input });

    if (errors) return console.error(errors);

    if (data?.forgotPassword.errors) {
      partitionErrors(
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
  };

  return (
    <Navbar>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ErrorList errors={genericErrors} />
        <input {...register('email')} placeholder="email" />
        {errors.email?.message}
        <button type="submit">send reset email</button>
      </form>
    </Navbar>
  );
}

export default withApollo(ForgotPasswordPage);
