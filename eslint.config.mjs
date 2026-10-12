// @ts-check
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'eslint.config.mjs',
      'dist/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      '*.js',
      '*.mjs',
      '*.generated.ts',
      'src/core/i18n/generated/**',
      'src/generated/**',
      'prisma/migrations/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Security plugin
  ...(security.configs?.recommended ? [security.configs.recommended] : []),

  // SonarJS for code quality and bug detection
  ...(sonarjs.configs?.recommended ? [sonarjs.configs.recommended] : []),

  // Import plugin for better import/export management
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,

  // Unicorn for modern JavaScript best practices
  {
    plugins: {
      unicorn,
    },
    rules: {
      'unicorn/better-regex': 'warn',
      'unicorn/catch-error-name': 'warn',
      'unicorn/consistent-destructuring': 'warn',
      'unicorn/consistent-function-scoping': 'warn',
      'unicorn/custom-error-definition': 'error',
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'warn',
      'unicorn/expiring-todo-comments': 'warn',
      'unicorn/explicit-length-check': 'warn',
      'unicorn/filename-case': [
        'warn',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
      'unicorn/new-for-builtins': 'error',
      'unicorn/no-abusive-eslint-disable': 'warn',
      'unicorn/no-array-callback-reference': 'off', // Can be confusing with TS
      'unicorn/no-array-for-each': 'off', // forEach is fine
      'unicorn/no-array-reduce': 'off', // reduce is useful
      'unicorn/no-await-expression-member': 'warn',
      'unicorn/no-console-spaces': 'warn',
      'unicorn/no-empty-file': 'warn',
      'unicorn/no-for-loop': 'warn',
      'unicorn/no-hex-escape': 'warn',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/no-invalid-remove-event-listener': 'error',
      'unicorn/no-keyword-prefix': 'off', // Allow keywords in names
      'unicorn/no-lonely-if': 'warn',
      'unicorn/no-negated-condition': 'warn',
      'unicorn/no-nested-ternary': 'warn',
      'unicorn/no-new-array': 'warn',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-null': 'off', // null is useful in APIs
      'unicorn/no-object-as-default-parameter': 'warn',
      'unicorn/no-process-exit': 'off', // OK in Node.js apps
      'unicorn/no-static-only-class': 'warn',
      'unicorn/no-thenable': 'error',
      'unicorn/no-this-assignment': 'warn',
      'unicorn/no-unnecessary-await': 'warn',
      'unicorn/no-unreadable-array-destructuring': 'warn',
      'unicorn/no-unreadable-iife': 'warn',
      'unicorn/no-useless-fallback-in-spread': 'warn',
      'unicorn/no-useless-length-check': 'warn',
      'unicorn/no-useless-promise-resolve-reject': 'warn',
      'unicorn/no-useless-spread': 'warn',
      'unicorn/no-useless-switch-case': 'warn',
      'unicorn/no-useless-undefined': 'off', // explicit undefined can be clearer
      'unicorn/no-zero-fractions': 'warn',
      'unicorn/number-literal-case': 'warn',
      'unicorn/numeric-separators-style': 'warn',
      'unicorn/prefer-add-event-listener': 'warn',
      'unicorn/prefer-array-find': 'warn',
      'unicorn/prefer-array-flat': 'warn',
      'unicorn/prefer-array-flat-map': 'warn',
      'unicorn/prefer-array-index-of': 'warn',
      'unicorn/prefer-array-some': 'warn',
      'unicorn/prefer-at': 'warn',
      'unicorn/prefer-blob-reading-methods': 'warn',
      'unicorn/prefer-code-point': 'warn',
      'unicorn/prefer-date-now': 'warn',
      'unicorn/prefer-default-parameters': 'warn',
      'unicorn/prefer-dom-node-append': 'warn',
      'unicorn/prefer-dom-node-dataset': 'warn',
      'unicorn/prefer-dom-node-remove': 'warn',
      'unicorn/prefer-dom-node-text-content': 'warn',
      'unicorn/prefer-event-target': 'warn',
      'unicorn/prefer-export-from': 'warn',
      'unicorn/prefer-includes': 'warn',
      'unicorn/prefer-json-parse-buffer': 'warn',
      'unicorn/prefer-keyboard-event-key': 'warn',
      'unicorn/prefer-logical-operator-over-ternary': 'warn',
      'unicorn/prefer-math-trunc': 'warn',
      'unicorn/prefer-modern-dom-apis': 'warn',
      'unicorn/prefer-modern-math-apis': 'warn',
      'unicorn/prefer-module': 'off', // CommonJS is fine for Node.js
      'unicorn/prefer-native-coercion-functions': 'warn',
      'unicorn/prefer-negative-index': 'warn',
      'unicorn/prefer-node-protocol': 'warn',
      'unicorn/prefer-number-properties': 'warn',
      'unicorn/prefer-object-from-entries': 'warn',
      'unicorn/prefer-optional-catch-binding': 'warn',
      'unicorn/prefer-prototype-methods': 'warn',
      'unicorn/prefer-query-selector': 'warn',
      'unicorn/prefer-reflect-apply': 'warn',
      'unicorn/prefer-regexp-test': 'warn',
      'unicorn/prefer-set-has': 'warn',
      'unicorn/prefer-set-size': 'warn',
      'unicorn/prefer-spread': 'warn',
      'unicorn/prefer-string-replace-all': 'warn',
      'unicorn/prefer-string-slice': 'warn',
      'unicorn/prefer-string-starts-ends-with': 'warn',
      'unicorn/prefer-string-trim-start-end': 'warn',
      'unicorn/prefer-switch': 'warn',
      'unicorn/prefer-ternary': 'warn',
      'unicorn/prefer-top-level-await': 'off', // Not always appropriate
      'unicorn/prefer-type-error': 'error',
      'unicorn/prevent-abbreviations': 'off', // Allow abbreviations
      'unicorn/relative-url-style': 'warn',
      'unicorn/require-array-join-separator': 'warn',
      'unicorn/require-number-to-fixed-digits-argument': 'warn',
      'unicorn/require-post-message-target-origin': 'warn',
      'unicorn/string-content': 'off',
      'unicorn/template-indent': 'warn',
      'unicorn/text-encoding-identifier-case': 'warn',
      'unicorn/throw-new-error': 'error',
    },
  },

  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // ============================================
      // Type Safety Rules
      // ============================================
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-declaration-merging': 'warn',

      // ============================================
      // Explicit Return Types
      // ============================================
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],

      // ============================================
      // Code Quality Rules
      // ============================================
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-empty-function': [
        'warn',
        {
          allow: ['arrowFunctions', 'functions', 'methods'],
        },
      ],
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-template-expression': 'warn',
      '@typescript-eslint/no-meaningless-void-operator': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-duplicate-type-constituents': 'warn',
      '@typescript-eslint/no-useless-empty-export': 'warn',
      '@typescript-eslint/no-import-type-side-effects': 'error',

      // ============================================
      // Nullish Coalescing & Optional Chaining
      // ============================================
      '@typescript-eslint/prefer-nullish-coalescing': [
        'warn',
        {
          ignoreConditionalTests: false,
          ignoreMixedLogicalExpressions: false,
        },
      ],
      '@typescript-eslint/prefer-optional-chain': 'error',

      // ============================================
      // Type Safety Enhancements
      // ============================================
      '@typescript-eslint/strict-boolean-expressions': [
        'warn',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowAny: false,
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        {
          ignoreArrowShorthand: false,
          ignoreVoidOperator: false,
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'warn',
      '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
      '@typescript-eslint/prefer-includes': 'warn',
      '@typescript-eslint/prefer-find': 'warn',

      // ============================================
      // Consistency Rules
      // ============================================
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off', // Too strict for NestJS DTOs
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],
      '@typescript-eslint/consistent-type-exports': [
        'warn',
        {
          fixMixedExportsWithInlineTypeSpecifier: true,
        },
      ],
      '@typescript-eslint/prefer-return-this-type': 'warn',
      '@typescript-eslint/method-signature-style': ['warn', 'property'],
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'], // Allow PascalCase for decorator factories
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'property',
          format: null, // Allow any format for properties (needed for API responses)
        },
      ],

      // ============================================
      // Security & Best Practices
      // ============================================
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-unused-expressions': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      // 'no-throw-literal': 'error', // Covered by @typescript-eslint/only-throw-error
      'no-return-await': 'off', // Use @typescript-eslint/return-await instead
      'prefer-template': 'warn',
      'prefer-spread': 'warn',
      'prefer-rest-params': 'warn',
      'prefer-destructuring': [
        'warn',
        {
          array: false,
          object: true,
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
      'no-useless-concat': 'warn',
      'no-useless-computed-key': 'warn',
      'no-useless-constructor': 'off', // NestJS uses constructors for DI
      'no-useless-rename': 'warn',
      'object-shorthand': ['warn', 'always'],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['warn', 'all'],
      'dot-notation': 'warn',

      // ============================================
      // Async/Promise Safety
      // ============================================
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      '@typescript-eslint/promise-function-async': 'warn',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],

      // ============================================
      // Error Handling
      // ============================================
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      '@typescript-eslint/only-throw-error': 'error',

      // ============================================
      // NestJS-Specific Considerations
      // ============================================
      // Note: There's no official NestJS ESLint plugin, but these rules
      // help catch common NestJS patterns:
      // - Constructor injection is type-safe (handled by TypeScript)
      // - Decorators are validated by TypeScript
      // - Async/await patterns are enforced above
      // - no-useless-constructor is disabled for DI
      '@typescript-eslint/parameter-properties': [
        'warn',
        {
          prefer: 'parameter-property',
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public',
          },
        },
      ],

      // ============================================
      // Plugin-Specific Overrides for NestJS
      // ============================================
      // SonarJS adjustments
      'sonarjs/cognitive-complexity': ['warn', 20], // Increase from default for complex business logic
      'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }], // More lenient for NestJS decorators
      'sonarjs/no-identical-functions': 'warn',

      // Import plugin adjustments
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/named': 'off', // TypeScript handles this
      'import/namespace': 'off', // TypeScript handles this
      'import/default': 'off', // TypeScript handles this
      'import/no-named-as-default-member': 'off', // Can conflict with NestJS patterns
      'import/no-named-as-default': 'off', // Can conflict with default exports
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'sibling',
            'parent',
            'index',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          warnOnUnassignedImports: false,
        },
      ],
      'import/newline-after-import': 'warn',
      'import/no-duplicates': [
        'warn',
        {
          considerQueryString: false,
          'prefer-inline': false,
        },
      ],
      'import/no-cycle': ['error', { maxDepth: 3, ignoreExternal: true }],
      'import/no-self-import': 'error',
      'import/first': 'warn',
      'import/exports-last': 'off',
      'import/no-namespace': 'off', // TypeScript namespaces can be useful

      // Security plugin adjustments
      'security/detect-object-injection': 'off', // Too many false positives in TypeScript
      'security/detect-non-literal-regexp': 'warn', // Downgrade from error

      // Prevent circular fixes
      'prettier/prettier': 'warn', // Downgrade from error to avoid blocking builds
    },
  },

  // Prettier must be last to override any formatting conflicts
  eslintPluginPrettierRecommended,

  // Final overrides to prevent circular fixes between plugins
  {
    rules: {
      'prettier/prettier': 'warn',
    },
  },
];
