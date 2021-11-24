import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Link from 'next/link';

import withApollo from '../lib/utils/withApollo';
import { LoginIn, useLoginMutation, UserError } from '../__generated__/graphql';
import { useAuthenticate } from '../lib/utils/useAuthenticate';
import { useQueryVar } from '../lib/utils/useQueryVar';
import ErrorList from '../components/ErrorList';
import { partitionErrors } from '../lib/utils/partitionErrors';

function LoginPage() {
  const [login] = useLoginMutation();
  const authenticate = useAuthenticate();

  const code = useQueryVar('code');

  const { register, handleSubmit, setError, formState } = useForm<LoginIn>();
  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const onSubmit: SubmitHandler<LoginIn> = async (input) => {
    const { errors, data } = await login({ variables: input });

    if (errors) return console.error(errors);

    if (data?.login.errors) {
      partitionErrors(
        data.login.errors,
        (err) =>
          setError(err.path as keyof LoginIn, {
            type: 'server',
            message: err.message,
          }),
        (errs) => setGenericErrors(errs)
      );
    }

    if (data?.login.accessToken && data.login.accessTokenExpiry) {
      await authenticate(
        data.login.accessToken,
        new Date(data.login.accessTokenExpiry as string),
        code && `/invite/${code}`
      );
    }
  };

  return (
    <div>
      <h1>login</h1>
      {code && <h2>login to proceed to space</h2>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <ErrorList errors={genericErrors} />
        <input {...register('email')} placeholder="email" />
        {formState.errors.email?.message}
        <input {...register('password')} placeholder="password" />
        {formState.errors.password?.message}
        <button type="submit">login</button>
        <Link
          href={{ pathname: '/register', ...(code && { query: { code } }) }}
        >
          register
        </Link>
        <Link href="/forgot-password">forgot password</Link>
      </form>
    </div>
  );
}

export default withApollo(LoginPage);
