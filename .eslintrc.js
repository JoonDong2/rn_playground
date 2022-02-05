module.exports = {
    root: true,
    extends: '@react-native-community',
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'jest', 'detox'],
    rules: {
        'prettier/prettier': [
            'warn',
            {
                tabWidth: 4,
                endOfLine: 'auto',
            },
        ],
        'no-shadow': 0,
        curly: 0,
        'react-native/no-inline-styles': 0,
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
    },
};
