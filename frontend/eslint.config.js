import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Allow unused variables/parameters when prefixed with _ (convention for
      // intentionally unused values, e.g. componentDidCatch parameters).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // routes.tsx uses lazyPlaceholder helper which returns valid LazyExoticComponents
  // but triggers react-refresh/only-export-components because the linter sees
  // function calls. This is safe: all exports are lazy components, and placeholders
  // will be replaced with real page imports as implementation progresses.
  {
    files: ['**/routes/routes.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
