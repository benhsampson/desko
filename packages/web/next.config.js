const withTranspiledModules = require('next-transpile-modules')([
  '@fullcalendar/common',
  '@fullcalendar/daygrid',
]);

module.exports = withTranspiledModules({
  publicRuntimeConfig: {
    API_URL: process.env.API_URL,
  },
});
