const JSDOM = require('jsdom').JSDOM;

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
  },
});
global.crypto.subtle = {
  digest: () => '',
}; // this gets around the 'auth0-spa-js must run on a secure origin' error
