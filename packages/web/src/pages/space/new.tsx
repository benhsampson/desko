import { useRouter } from 'next/router';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import ErrorList from '../../components/ErrorList';
import Navbar from '../../components/Navbar';
import { partitionErrors } from '../../lib/utils/partitionErrors';
import withApollo from '../../lib/utils/withApollo';
import withAuth from '../../lib/utils/withAuth';
import {
  CreateSpaceIn,
  useCreateSpaceMutation,
  UserError,
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

  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const onSubmit: SubmitHandler<CreateSpaceIn> = async (input) => {
    const { errors, data } = await createSpace({
      variables: input,
    });

    if (errors) return console.error(errors);

    if (data?.createSpace.errors) {
      return partitionErrors(
        data.createSpace.errors,
        (err) =>
          setError(err.path as keyof CreateSpaceIn, {
            type: 'server',
            message: err.message,
          }),
        (errs) => setGenericErrors(errs)
      );
    }

    await router.push('/spaces');
  };

  return (
    <Navbar>
      <h1>create new space</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ErrorList errors={genericErrors} />
        <input {...register('name')} placeholder="name" />
        {errors.name?.message}
        <input
          {...register('maxBookingsPerDay', {
            valueAsNumber: true,
            required: true,
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
