import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Link from 'next/link';

import withApollo from '../lib/utils/withApollo';
import { RegisterIn, useRegisterMutation } from '../__generated__/graphql';
import { useAuthenticate } from '../lib/utils/useAuthenticate';
import Navbar from '../components/Navbar';
import { useQueryVar } from '../lib/utils/useQueryVar';

function RegisterPage() {
  const [registerUser] = useRegisterMutation();
  const authenticate = useAuthenticate();

  const code = useQueryVar('code');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterIn>({
    defaultValues: { role: code ? 'USER' : 'MANAGER' },
  });
  const [genericErrors, setGenericErrors] = useState<string[]>([]);

  const onSubmit: SubmitHandler<RegisterIn> = async (input) => {
    const { errors, data } = await registerUser({ variables: input });

    if (errors) {
      return setGenericErrors(errors.map((e) => e.message));
    }

    if (data?.register.errors) {
      return data.register.errors.forEach(({ path, message }) =>
        path
          ? setError(path as keyof RegisterIn, { type: 'server', message })
          : setGenericErrors([...genericErrors, message])
      );
    }

    setGenericErrors([]);

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
        {genericErrors.length ? (
          <ul>
            {genericErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        <input {...register('fullName')} placeholder="full name" />
        {errors.fullName?.message}
        <input {...register('email')} placeholder="email" />
        {errors.email?.message}
        <input {...register('password')} placeholder="password" />
        {errors.password?.message}
        <button type="submit">create account</button>
        <Link href={{ pathname: '/login', ...(code && { query: { code } }) }}>
          login
        </Link>
      </form>
    </div>
  );
}

export default withApollo(RegisterPage);
