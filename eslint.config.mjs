// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1. Ignore patterns
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
  },
  
  // 2. Base recommended configs
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  
  // 3. Global language options
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  
  // 4. Project-wide relaxed rules (for NestJS patterns)
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn', // 👈 Changed from error to warn
      '@typescript-eslint/no-unsafe-member-access': 'warn', // 👈 Same here
      '@typescript-eslint/no-unsafe-assignment': 'warn', // 👈 And here
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  
  {
    files: ['src/**/dto/*.ts', 'src/**/entities/*.ts', 'src/**/*.entity.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-call': 'off', // Decorators trigger false positives
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
);