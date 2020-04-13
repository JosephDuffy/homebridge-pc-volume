module.exports = {
  preset: "ts-jest",
  roots: ["src/"],
  testPathIgnorePatterns: ["/src/__tests__/helpers/"],
  collectCoverageFrom: ["src/{!(__tests___),}.ts"]
}
