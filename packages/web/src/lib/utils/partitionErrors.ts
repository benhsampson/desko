import { UserError } from '../../__generated__/graphql';
import { partition } from './partition';

export const partitionErrors = (
  errors: UserError[],
  addPathError: (err: UserError) => void,
  addNonPathErrors: (errs: UserError[]) => void
) => {
  const [pathErrors, nonPathErrors] = partition(errors, (err) => !!err.path);
  pathErrors.forEach((err) => addPathError(err));
  addNonPathErrors(nonPathErrors);
};
