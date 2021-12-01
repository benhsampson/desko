import { ApolloError } from '@apollo/client';

export default function ErrorDisplay(props: { error?: ApolloError }) {
  return <p>{props.error?.message}</p>;
}
