import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import DashboardLayout from '../../components/DashboardLayout';

import ErrorList from '../../components/ErrorList';
import { partitionErrors } from '../../lib/utils/partitionErrors';
import withApollo from '../../lib/utils/withApollo';
import withAuth from '../../lib/utils/withAuth';
import {
  CreateSpaceIn,
  useCreateSpaceMutation,
  UserError,
} from '../../__generated__/graphql';

const SpaceNewPage = () => {
  const [createSpace, { loading }] = useCreateSpaceMutation();

  const { register, handleSubmit, setError, formState } =
    useForm<CreateSpaceIn>();

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
    <DashboardLayout>
      <Box maxWidth={480} p={4}>
        <Typography variant="h4" gutterBottom>
          Create new space
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <ErrorList errors={genericErrors} />
            <TextField
              label="Name"
              error={!!formState.errors.name?.message}
              helperText={formState.errors.name?.message}
              {...register('name', { required: true })}
            />
            <TextField
              type="number"
              label="Max bookings per day"
              error={!!formState.errors.maxBookingsPerDay?.message}
              helperText={formState.errors.maxBookingsPerDay?.message}
              {...register('maxBookingsPerDay', {
                valueAsNumber: true,
                required: true,
              })}
            />
            <Button
              disabled={loading}
              type="submit"
              size="large"
              variant="contained"
            >
              Create
            </Button>
          </Stack>
        </form>
      </Box>
    </DashboardLayout>
  );
};

export default withApollo(withAuth(SpaceNewPage));
