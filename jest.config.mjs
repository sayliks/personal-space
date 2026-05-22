import nextJest from "next/jest.js"

const createJestConfig = nextJest({ dir: "./" })

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^github-slugger$": "<rootDir>/__mocks__/github-slugger.ts",
  },
}

export default createJestConfig(config)
