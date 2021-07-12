const bookingResolver = require('./booking');
const eventResolver = require('./event');
const userResolver = require('./user');

const rootResolver = {
  ...bookingResolver,
  ...eventResolver,
  ...userResolver,
};

module.exports = rootResolver;
