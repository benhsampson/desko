import moment from 'moment';

export const TIMESTAMP_FORMAT = 'YYYY-MM-DD';

export default function formatAsTimestamp(y: number, m: number, d: number) {
  return moment([y, m, d]).format(TIMESTAMP_FORMAT);
}

export function formatISOAsTimestamp(isoDate: string) {
  return moment(isoDate).format(TIMESTAMP_FORMAT);
}
