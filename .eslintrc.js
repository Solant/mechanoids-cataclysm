module.exports = {
    extends: ["airbnb-typescript/base"],
    rules: {
        'import/prefer-default-export': ['off'],
        "@typescript-eslint/indent": ["error", 4],
        'max-len': ['error', { code: 120 }],
    }
};
