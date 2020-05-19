module.exports = {
  preset: "ts-jest",
  roots: ["src/"],
  testPathIgnorePatterns: ["/src/__tests__/mocks/"],
  collectCoverageFrom: ["src/{!(__tests___),}.ts"],
}
