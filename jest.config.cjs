module.exports = {
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    transform: {
      '^.+\\.js$': 'babel-jest',
    },
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverage: true,
    coverageDirectory: "coverage",         // Directory where coverage reports will be output
    coverageReporters: ["json", "html"],   // Types of coverage reports (json, html, lcov, etc.)
  };
  