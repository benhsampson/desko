import { SchemaOf, ValidationError } from 'yup';

export const validateInput = async <T>(schema: SchemaOf<T>, input: T) =>
  schema
    .validate(input)
    .then(() => ({ errors: undefined }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        return { errors: [{ message: err.message, path: err.path }] };
      } else {
        throw err;
      }
    });
