module.exports = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testRegex: "tests/.+\\.(e2e-)?spec\\.ts$",
  moduleDirectories: ["node_modules", "src"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.module.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.interface.ts",
    "!src/database/migrations/**",
  ],
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  setupFiles: ["./tests/setup.ts"],
  notify: true,
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },
};
