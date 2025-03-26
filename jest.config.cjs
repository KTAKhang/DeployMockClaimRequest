module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|scss|less)$": "identity-obj-proxy", // ✅ Mock CSS imports
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/jest.fileMock.js",
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
