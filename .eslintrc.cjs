module.exports = {
  extends: ['mantine'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
     'react/react-in-jsx-scope': 'off',
     'import/extensions': 'off',
     'jsx-a11y/click-events-have-key-events': 'off',
     'jsx-a11y/no-static-element-interactions': 'off',
     'no-restricted-globals': 'off',
     '@typescript-eslint/no-unused-vars': 'off',
     '@typescript-eslint/no-shadow': 'off',
     'max-len': ["error", { "code": 300 }],
     'no-console':  'off',
     'react/jsx-indent' : 'off',
     'react/jsx-indent-props': 'off'
  },
};
