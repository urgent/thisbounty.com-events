module.exports = {
    setupFiles: [
        'dotenv/config'
    ],
    moduleNameMapper: {
        "^.+\\.(css|less|scss)$": "identity-obj-proxy"
    },
    watchPathIgnorePatterns: ["node_modules"],
    modulePathIgnorePatterns: ["node_modules",],
    maxConcurrency: 1
}