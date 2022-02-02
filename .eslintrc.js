module.exports = {
    root: true,
    extends: '@react-native-community',
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
        'prettier/prettier': [
            'warn',
            {
                tabWidth: 4,
            },
        ],
        'no-shadow': 0,
        curly: 0,
        'react-native/no-inline-styles': 0,
    },
};
