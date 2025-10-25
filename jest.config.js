export default {
  testEnvironment: 'node',
  transform: {},
  verbose: true,
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js', '!src/migrations/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
};
