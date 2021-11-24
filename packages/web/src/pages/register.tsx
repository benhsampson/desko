import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Link from 'next/link';

import withApollo from '../lib/utils/withApollo';
import {
  RegisterIn,
  useRegisterMutation,
  UserError,
} from '../__generated__/graphql';
import { useAuthenticate } from '../lib/utils/useAuthenticate';
import { useQueryVar } from '../lib/utils/useQueryVar';
import { partitionErrors } from '../lib/utils/partitionErrors';
import ErrorList from '../components/ErrorList';

function RegisterPage() {
  const [registerUser] = useRegisterMutation();
  const authenticate = useAuthenticate();

  const code = useQueryVar('code');

  const { register, handleSubmit, setError, formState } = useForm<RegisterIn>({
    defaultValues: { role: code ? 'USER' : 'MANAGER' },
  });
  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const onSubmit: SubmitHandler<RegisterIn> = async (input) => {
    const { errors, data } = await registerUser({ variables: input });

    if (errors) return console.error(errors);

    if (data?.register.errors) {
      partitionErrors(
        data.register.errors,
        (err) =>
          setError(err.path as keyof RegisterIn, {
            type: 'server',
            message: err.message,
          }),
        (errs) => setGenericErrors(errs)
      );
    }

    if (data?.register.accessToken && data.register.accessTokenExpiry) {
      await authenticate(
        data.register.accessToken,
        new Date(data.register.accessTokenExpiry as string),
        code && `/invite/${code}`
      );
    }
  };

  return (
    <div>
      <h1>register</h1>
      {code && <h2>register to proceed to space</h2>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <ErrorList errors={genericErrors} />
        <input {...register('fullName')} placeholder="full name" />
        {formState.errors.fullName?.message}
        <input {...register('email')} placeholder="email" />
        {formState.errors.email?.message}
        <input {...register('password')} placeholder="password" />
        {formState.errors.password?.message}
        <button type="submit">create account</button>
        <Link href={{ pathname: '/login', ...(code && { query: { code } }) }}>
          login
        </Link>
      </form>
    </div>
  );
}

export default withApollo(RegisterPage);
