module.exports = {
    setupFiles: [
        'dotenv/config',
        'ws'
    ],
    moduleNameMapper: {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/__mocks__/fileMock.js",
        "^.+\\.(css|less|scss)$": "identity-obj-proxy"
    },
    watchPathIgnorePatterns: ["node_modules"],
    modulePathIgnorePatterns: ["node_modules",],
    testPathIgnorePatterns: [
        "/node_modules/"
    ],
    coveragePathIgnorePatterns: [
        "node_modules",
        "dist"
    ],
    maxConcurrency: 1,
    preset: "jest-puppeteer"
}