import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SubmitHandler, useForm } from 'react-hook-form';

import Navbar from '../../../components/Navbar';
import { useQueryVar } from '../../../lib/utils/useQueryVar';
import withApollo from '../../../lib/utils/withApollo';
import withAuth from '../../../lib/utils/withAuth';
import {
  UpdateSpaceIn,
  UserError,
  useSpaceInfoQuery,
  useUpdateSpaceMutation,
} from '../../../__generated__/graphql';
import { partitionErrors } from '../../../lib/utils/partitionErrors';
import ErrorList from '../../../components/ErrorList';

const SpaceEditPage = () => {
  // TODO: Check if null in getInitialProps()
  const spaceId = useQueryVar('id') || '404';

  const spaceInfo = useSpaceInfoQuery({
    variables: { spaceId },
  });

  const [updateSpace] = useUpdateSpaceMutation();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<UpdateSpaceIn>({
    defaultValues: {
      ...spaceInfo.data?.spaceInfo,
    },
  });

  useEffect(() => {
    reset(spaceInfo.data?.spaceInfo);
  }, [reset, spaceInfo.data?.spaceInfo]);

  const [genericErrors, setGenericErrors] = useState<UserError[]>([]);

  const onSubmit: SubmitHandler<UpdateSpaceIn> = async (input) => {
    const dirtyInput = [...(Object.keys(input) as (keyof UpdateSpaceIn)[])]
      .filter((key) => dirtyFields[key])
      .reduce(
        (acc, key) => ({
          ...acc,
          [key]: input[key],
        }),
        {}
      );

    if (Object.keys(dirtyInput).length === 0) {
      return;
    }

    const { errors, data } = await updateSpace({
      variables: { spaceId, ...dirtyInput },
      refetchQueries: ['SpaceInfo'],
    });

    if (errors) return console.error(errors);

    if (data?.updateSpace.errors) {
      partitionErrors(
        data.updateSpace.errors,
        (err) =>
          setError(err.path as keyof UpdateSpaceIn, {
            type: 'server',
            message: err.message,
          }),
        (errs) => setGenericErrors(errs)
      );
    }

    setGenericErrors([]);

    if (data?.updateSpace.space) {
      // Reset dirty form state.
      reset(data.updateSpace.space);
    }
  };

  return (
    <Navbar>
      {!spaceInfo.loading && spaceInfo.data ? (
        <h1>
          edit{' '}
          <Link href={`/space/${spaceInfo.data?.spaceInfo.id}`}>
            {spaceInfo.data?.spaceInfo.name}
          </Link>
        </h1>
      ) : (
        <p>loading...</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <ErrorList errors={genericErrors} />
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
        <button type="submit">save</button>
      </form>
    </Navbar>
  );
};

export default withApollo(withAuth(SpaceEditPage));
