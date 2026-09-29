const js = require('@eslint/js')
const pluginVue = require('eslint-plugin-vue')
const tseslint = require('typescript-eslint')
const globals = require('globals')

module.exports = tseslint.config(
  {
    ignores: ['.quasar/**', 'dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue', '**/*.ts', '**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },
  {
    files: ['eslint.config.js', 'quasar.config.ts'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['eslint.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
)
