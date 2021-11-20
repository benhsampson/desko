import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Link from 'next/link';

import withApollo from '../lib/utils/withApollo';
import { LoginIn, useLoginMutation } from '../__generated__/graphql';
import { useAuthenticate } from '../lib/utils/useAuthenticate';

function LoginPage() {
  const [login] = useLoginMutation();
  const authenticate = useAuthenticate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginIn>();
  const [genericErrors, setGenericErrors] = useState<string[]>([]);

  const onSubmit: SubmitHandler<LoginIn> = async (input) => {
    const { errors, data } = await login({ variables: input });

    if (errors) {
      return setGenericErrors(errors.map((e) => e.message));
    }

    if (data?.login.errors) {
      return data.login.errors.forEach(({ path, message }) =>
        path
          ? setError(path as keyof LoginIn, { type: 'server', message })
          : setGenericErrors([...genericErrors, message])
      );
    }

    setGenericErrors([]);

    if (data?.login.accessToken && data.login.accessTokenExpiry) {
      await authenticate(
        data.login.accessToken,
        new Date(data.login.accessTokenExpiry as string)
      );
    }
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
        <input {...register('password')} />
        {errors.password?.message}
        <button type="submit">login</button>
        <Link href="/register">register</Link>
      </form>
    </div>
  );
}

export default withApollo(LoginPage);
