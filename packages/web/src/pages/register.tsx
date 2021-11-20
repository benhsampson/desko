import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Link from 'next/link';

import withApollo from '../lib/utils/withApollo';
import { RegisterIn, useRegisterMutation } from '../__generated__/graphql';

function RegisterPage() {
  const [registerUser] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterIn>();
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
    alert('Successful');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {genericErrors.length ? (
        <ul>
          {genericErrors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      ) : null}
      <input {...register('fullName')} />
      {errors.fullName?.message}
      <input {...register('email')} />
      {errors.email?.message}
      <input {...register('password')} />
      {errors.password?.message}
      <button type="submit">create account</button>
      <Link href="/login">login</Link>
    </form>
  );
}

export default withApollo(RegisterPage);
