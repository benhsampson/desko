import { NextPage } from 'next';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SubmitHandler, useForm } from 'react-hook-form';

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
import DashboardLayout from 'packages/web/src/components/DashboardLayout';
import Loader from 'packages/web/src/components/Loader';
import getCtxQueryVar from 'packages/web/src/lib/utils/getCtxQueryVar';

type Props = {
  spaceId: string;
};

const SpaceEditPage: NextPage<Props> = ({ spaceId }) => {
  const spaceInfo = useSpaceInfoQuery({
    variables: { spaceId },
  });

  const [updateSpace, { loading }] = useUpdateSpaceMutation();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { dirtyFields, errors },
  } = useForm<UpdateSpaceIn>({
    defaultValues: {
      ...spaceInfo.data?.spaceInfo,
    },
  });

  useEffect(() => {
    if (spaceInfo.data?.spaceInfo) {
      console.log('RESET');
      const info = spaceInfo.data.spaceInfo;
      reset({
        name: info.name,
        maxBookingsPerDay: info.maxBookingsPerDay,
      });
    }
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
    <DashboardLayout>
      {/* {JSON.stringify(formState.dirtyFields)} */}
      <Box maxWidth={480} p={4}>
        {!spaceInfo.loading && spaceInfo.data ? (
          <Typography variant="h4" gutterBottom>
            Edit{' '}
            <Link href={`/space/${spaceInfo.data?.spaceInfo.id}`}>
              {spaceInfo.data?.spaceInfo.name}
            </Link>
          </Typography>
        ) : (
          <Loader />
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <ErrorList errors={genericErrors} />
            <TextField
              label="Name"
              {...register('name', { required: true })}
              error={!!errors.name?.message}
              helperText={errors.name?.message}
            />
            <TextField
              {...register('maxBookingsPerDay', {
                valueAsNumber: true,
                required: true,
              })}
              placeholder="max bookings per day"
              type="number"
              error={!!errors.maxBookingsPerDay?.message}
              helperText={errors.maxBookingsPerDay?.message}
            />
            <Button
              disabled={loading}
              type="submit"
              size="large"
              variant="contained"
            >
              Save
            </Button>
          </Stack>
        </form>
      </Box>
    </DashboardLayout>
  );
};

// eslint-disable-next-line @typescript-eslint/require-await
SpaceEditPage.getInitialProps = async (ctx) => {
  const spaceId = getCtxQueryVar(ctx.query, 'id');
  return { spaceId };
};

export default withApollo(withAuth(SpaceEditPage));
