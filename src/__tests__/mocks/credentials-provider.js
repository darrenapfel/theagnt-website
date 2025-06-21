// Mock Credentials provider for testing
module.exports = function Credentials(config) {
  return {
    id: 'credentials',
    name: 'Credentials',
    type: 'credentials',
    ...config
  };
};