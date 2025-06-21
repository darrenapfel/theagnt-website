// Mock Google OAuth provider for testing
module.exports = function Google(config) {
  return {
    id: 'google',
    name: 'Google',
    type: 'oauth',
    options: config
  };
};