import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    '.worktrees',
    '.claude',
    'Claude',
    'docs/.vitepress/cache',
    'docs/.vitepress/dist',
    // VitePress 每次构建都会重建的临时产物；不排除的话一次本地 build 就能刷出上万条 lint 报错
    'docs/.vitepress/.temp',
    'docs/.vitepress/config.js.timestamp-*.mjs',
    'docs/.vitepress/theme',
    // 首页演示的同源镜像，是另一个工程的构建产物，不参与本站 lint
    'docs/public/demo',
  ]),
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['scripts/**/*.{js,mjs}', 'docs/.vitepress/*.{js,mjs}', 'plans/dither-logo/build.mjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['tests/**/*.{js,mjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
