import { IncomingMessage } from 'http';

const IS_SERVER = typeof window === 'undefined';

function getBaseUrl(req?: IncomingMessage) {
  console.log(req?.headers.host);
  const _forwardedHost = req?.headers['x-forwarded-host'];
  const forwardedHost = Array.isArray(_forwardedHost)
    ? _forwardedHost[0]
    : _forwardedHost;
  const host = IS_SERVER
    ? forwardedHost || req?.headers.host || 'localhost'
    : window.location.host;
  const _forwardedProtocol = req?.headers['x-forwarded-proto'];
  const forwardedProtocol = Array.isArray(_forwardedProtocol)
    ? _forwardedProtocol[0]
    : _forwardedProtocol;
  const protocol = IS_SERVER
    ? forwardedProtocol ||
      (/^localhost(:\d+)?$/.test(host) ? 'http:' : 'https:')
    : window.location.protocol;
  return {
    raw: `${protocol}//${host}`,
    pretty: host,
  };
}

export default getBaseUrl;
