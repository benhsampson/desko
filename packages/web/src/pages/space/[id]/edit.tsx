import { useEffect, useState } from 'react';

import { SubmitHandler, useForm } from 'react-hook-form';
import Navbar from '../../../components/Navbar';
import { partition } from '../../../lib/utils/partition';
import { useQueryVar } from '../../../lib/utils/useQueryVar';
import withApollo from '../../../lib/utils/withApollo';
import withAuth from '../../../lib/utils/withAuth';
import {
  UpdateSpaceIn,
  useSpaceInfoQuery,
  useUpdateSpaceMutation,
} from '../../../__generated__/graphql';

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

  const [genericErrors, setGenericErrors] = useState<string[]>([]);

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
    });

    if (errors) return setGenericErrors(errors.map((e) => e.message));

    if (data?.updateSpace.errors) {
      const [pathErrors, nonPathErrors] = partition(
        data?.updateSpace.errors || [],
        (e) => !!e.path
      );
      pathErrors.forEach(({ path, message }) =>
        setError(path as keyof UpdateSpaceIn, { type: 'server', message })
      );
      return setGenericErrors(nonPathErrors.map((e) => e.message));
    }

    setGenericErrors([]);

    if (data?.updateSpace.space) {
      // Reset dirty form state.
      reset(data.updateSpace.space);
    }
  };

  return (
    <Navbar>
      <h1>edit {spaceInfo.data?.spaceInfo.name}</h1>
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
        <button type="submit">save</button>
      </form>
    </Navbar>
  );
};

export default withApollo(withAuth(SpaceEditPage));
