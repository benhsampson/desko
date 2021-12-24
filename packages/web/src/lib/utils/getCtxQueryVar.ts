import { ParsedUrlQuery } from 'querystring';

export default function getCtxQueryVar(query: ParsedUrlQuery, key: string) {
  const _value = query[key];

  if (Array.isArray(_value)) {
    if (_value.length > 0) {
      return _value[0];
    } else {
      throw new Error('QUERY_VAR_EMPTY_ARRAY');
    }
  } else if (_value) {
    return _value;
  } else {
    throw new Error('QUERY_VAR_UNDEFINED_OR_EMPTY_STRING');
  }
}
