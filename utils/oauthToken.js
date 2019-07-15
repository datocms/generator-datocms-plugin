const oauthCli = require('oauth-cli');

const oauthOptions = {
  authCode: {
    endpoint: 'https://oauth.datocms.com/oauth/authorize',
    redirectUrl: 'http://localhost:8080/',
    scopes: ['read_sites', 'read_account']
  },
  accessToken: {
    endpoint: 'https://oauth.datocms.com/oauth/token',
    clientAuth: 'form',
  },
  client: {
    id: '91fbd237461fd8fbae95570765cb06a392429859f9804729f39b394ca7258e59',
    secret: '51b2149b719ec0352d90319b5e49e520b0d6202437c380ae6e46416f0b70d914',
  },
};

module.exports = () => new Promise((resolve, reject) => (
  oauthCli(
    oauthOptions,
    {},
    (error, credentials) => {
      if (error) {
        reject(error);
      } else {
        resolve(credentials);
      }
    }
  )
));
