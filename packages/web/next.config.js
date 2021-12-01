const withTranspiledModules = require('next-transpile-modules')([
  '@fullcalendar/common',
  '@fullcalendar/daygrid',
]);

module.exports = withTranspiledModules({
  publicRuntimeConfig: {
    API_URL: process.env.API_URL,
  },
  experimental: {
    externalDir: true,
  },
  async redirects() {
    return [{ source: '/', destination: '/spaces', permanent: true }];
  },
});
