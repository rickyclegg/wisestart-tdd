/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testPathIgnorePatterns: ['/node_modules/', '/src/', '/integration-tests/'],
  detectOpenHandles: true,
  bail: true
}
