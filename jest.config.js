/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["src/"],
  testPathIgnorePatterns: ["/src/__tests__/mocks/"],
  collectCoverageFrom: ["src/**/*.ts", "!src/__tests__/*"],
}
