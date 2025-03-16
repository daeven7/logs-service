module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/src/**/*.test.ts'], // Look for test files in the src folder
    // testMatch: ['<rootDir>/src/**/*.test.ts'], // Look for test files in the src folder
    moduleDirectories: ['node_modules', 'src'], // Allow imports from src without relative paths
    verbose: true,
    silent: false
    // moduleNameMapper: {
    //   // Optional: Alias handling if you use path mappings in tsconfig
    //   '^@/(.*)$': '<rootDir>/src/$1',
    // },
  };