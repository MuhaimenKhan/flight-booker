const Amadeus = require('amadeus');

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
  environment: 'test', // explicitly use the test environment
});

module.exports = amadeus;
