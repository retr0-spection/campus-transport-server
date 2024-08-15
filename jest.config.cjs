module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
    testMatch: ['**/tests/**/*.test.js'],
  };
  