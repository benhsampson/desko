import { useRouter } from 'next/router';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Navbar from '../../components/Navbar';
import { partition } from '../../lib/utils/partition';
import withApollo from '../../lib/utils/withApollo';
import withAuth from '../../lib/utils/withAuth';
import {
  CreateSpaceIn,
  useCreateSpaceMutation,
} from '../../__generated__/graphql';

const SpaceNewPage = () => {
  const [createSpace] = useCreateSpaceMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateSpaceIn>();

  const router = useRouter();

  const [genericErrors, setGenericErrors] = useState<string[]>([]);

  const onSubmit: SubmitHandler<CreateSpaceIn> = async (input) => {
    const { errors, data } = await createSpace({
      variables: input,
    });

    if (errors) return setGenericErrors(errors.map((e) => e.message));

    if (data?.createSpace.errors) {
      const [pathErrors, nonPathErrors] = partition(
        data?.createSpace.errors || [],
        (e) => !!e.path
      );
      pathErrors.forEach(({ path, message }) =>
        setError(path as keyof CreateSpaceIn, { type: 'server', message })
      );
      return setGenericErrors(nonPathErrors.map((e) => e.message));
    }

    setGenericErrors([]);

    await router.push('/spaces');
  };

  return (
    <Navbar>
      <h1>create new space</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        {genericErrors.length ? (
          <ul>
            {genericErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        ) : null}
        <input {...register('name')} placeholder="name" />
        {errors.name?.message}
        <input
          {...register('maxBookingsPerDay', {
            valueAsNumber: true,
          })}
          placeholder="max bookings per day"
          type="number"
          step="1"
        />
        {errors.maxBookingsPerDay?.message}
        <button type="submit">create</button>
      </form>
    </Navbar>
  );
};

export default withApollo(withAuth(SpaceNewPage));
