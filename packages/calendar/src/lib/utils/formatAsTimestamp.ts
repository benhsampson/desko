import moment from 'moment';

export default function formatAsTimestamp(y: number, m: number, d: number) {
  return moment([y, m, d]).format('YYYY-MM-DD');
}
