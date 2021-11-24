import { UserError } from '../__generated__/graphql';

type Props = {
  errors: UserError[];
};

const ErrorList = ({ errors }: Props) =>
  errors.length ? (
    <ul>
      {errors.map((e, i) => (
        <li key={i}>{e.message}</li>
      ))}
    </ul>
  ) : null;

export default ErrorList;
