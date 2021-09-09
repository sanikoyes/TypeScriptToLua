module.exports = {
    extends: ["plugin:jest/recommended", "plugin:jest/style"],
    parserOptions: {
        sourceType: "module",
        project: ["test/tsconfig.json", "src/lualib/tsconfig.json", "benchmark/tsconfig.json"],
    },
    env: { es6: true, node: true },
    plugins: ["import"],
    rules: {
        "arrow-body-style": "error",
        curly: ["error", "multi-line"],
        eqeqeq: ["error", "always", { null: "ignore" }],
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-debugger": "error",
        "no-duplicate-case": "error",
        "no-new-wrappers": "error",
        "no-restricted-globals": ["error", "parseInt", "parseFloat"],
        "no-unused-labels": "error",
        "no-var": "error",
        "object-shorthand": "error",
        "prefer-const": ["error", { destructuring: "all" }],
        radix: "error",
        "use-isnan": "error",
        "object-shorthand": [
            "error",
            "always",
            { avoidQuotes: true, ignoreConstructors: false, avoidExplicitReturnArrows: true },
        ],
        "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "SequenceExpression"],
        "spaced-comment": [
            "error",
            "always",
            {
                line: { exceptions: ["-", "+"], markers: ["=", "!", "/"] },
                block: { exceptions: ["-", "+"], markers: ["=", "!", ":", "::"], balanced: true },
            },
        ],
        "no-delete-var": ["error"],
        "no-label-var": ["error"],
        yoda: ["error"],
        "prefer-numeric-literals": ["error"],
        "prefer-rest-params": ["error"],
        "prefer-spread": ["error"],
        "no-useless-computed-key": ["error"],
        "for-direction": ["error"],
        "no-compare-neg-zero": ["error"],
        "no-dupe-else-if": ["error"],
        "no-empty": ["error", { allowEmptyCatch: true }],
        "no-implicit-coercion": ["error", { boolean: true, number: true, string: true }],
        "operator-assignment": ["error"],
        "no-path-concat": ["error"],
        "no-compare-neg-zero": ["error"],
        "no-control-regex": ["error"],
        "no-unneeded-ternary": ["error", { defaultAssignment: false }],
        "one-var": ["error", "never"],
        "prefer-exponentiation-operator": ["error"],
        "prefer-object-spread": ["error"],
        "no-useless-call": ["off"],
        "no-useless-catch": ["error"],
        "no-useless-concat": ["error"],
        "no-useless-escape": ["error"],
        "no-useless-return": ["error"],

        "import/no-default-export": "error",
        // TODO currently only works for direct imports (useless for now) https://github.com/benmosher/eslint-plugin-import/issues/1729
        // "import/no-deprecated": "error",

        "jest/expect-expect": "off",
        "jest/consistent-test-it": ["error", { fn: "test", withinDescribe: "test" }],
        "jest/no-expect-resolves": "error",
        "jest/no-test-return-statement": "error",
        "jest/no-truthy-falsy": "error",
        "jest/prefer-spy-on": "error",
        "jest/prefer-todo": "error",
        "jest/valid-title": "error",
        // TODO:
        // "jest/lowercase-name": "error",
    },
    overrides: [
        {
            files: "**/*.ts",
            extends: ["plugin:@typescript-eslint/base"],
            rules: {
                // https://github.com/ark120202/eslint-config/blob/2c24f13fd99af7ccf29e56d5d936b3ab0f237db6/bases/typescript.js
                "@typescript-eslint/adjacent-overload-signatures": "error",
                "@typescript-eslint/array-type": "error",
                "@typescript-eslint/await-thenable": "error",
                "@typescript-eslint/ban-types": [
                    "error",
                    {
                        types: {
                            Function: null,
                            CallableFunction: { fixWith: "(...args: any[]) => any" },
                            NewableFunction: { fixWith: "new (...args: any[]) => any" },
                        },
                    },
                ],
                camelcase: "off",
                "@typescript-eslint/camelcase": ["error", { properties: "never", ignoreDestructuring: true }],
                "@typescript-eslint/consistent-type-assertions": [
                    "error",
                    { assertionStyle: "as", objectLiteralTypeAssertions: "never" },
                ],
                "@typescript-eslint/consistent-type-definitions": "error",
                "@typescript-eslint/explicit-member-accessibility": [
                    "error",
                    { overrides: { constructors: "no-public" } },
                ],
                "no-array-constructor": "off",
                "@typescript-eslint/no-array-constructor": "error",
                "@typescript-eslint/no-empty-interface": "error",
                "@typescript-eslint/no-extra-non-null-assertion": "error",
                "@typescript-eslint/no-extraneous-class": "error",
                "@typescript-eslint/no-floating-promises": "error",
                "@typescript-eslint/no-for-in-array": "error",
                "@typescript-eslint/no-inferrable-types": "error",
                "@typescript-eslint/no-misused-new": "error",
                "@typescript-eslint/no-misused-promises": "error",
                "@typescript-eslint/no-namespace": "error",
                "@typescript-eslint/no-require-imports": "error",
                "@typescript-eslint/no-this-alias": "error",
                "no-throw-literal": "off",
                "@typescript-eslint/no-throw-literal": "error",
                "no-constant-condition": "off",
                "@typescript-eslint/no-unnecessary-condition": [
                    "error",
                    { ignoreRhs: true, allowConstantLoopConditions: true },
                ],
                "@typescript-eslint/no-unnecessary-qualifier": "error",
                "@typescript-eslint/no-unnecessary-type-arguments": "error",
                "@typescript-eslint/no-unnecessary-type-assertion": "error",
                "no-unused-expressions": "off",
                "@typescript-eslint/no-unused-expressions": "error",
                "no-useless-constructor": "off",
                "@typescript-eslint/no-useless-constructor": "error",
                "@typescript-eslint/prefer-function-type": "error",
                "@typescript-eslint/prefer-includes": "error",
                "@typescript-eslint/prefer-optional-chain": "error",
                "@typescript-eslint/prefer-namespace-keyword": "error",
                "@typescript-eslint/prefer-readonly": "error",
                "@typescript-eslint/prefer-string-starts-ends-with": "error",
                "@typescript-eslint/promise-function-async": ["error", { checkArrowFunctions: false }],
                quotes: "off",
                "@typescript-eslint/quotes": ["error", "single", { avoidEscape: true, allowTemplateLiterals: false }],
                "@typescript-eslint/require-array-sort-compare": "error",
                "@typescript-eslint/require-await": "error",
                "@typescript-eslint/restrict-plus-operands": ["error", { checkCompoundAssignments: true }],
                "@typescript-eslint/return-await": "error",
                "@typescript-eslint/triple-slash-reference": "error",
                "@typescript-eslint/unified-signatures": "error",
                // end of https://github.com/ark120202/eslint-config/blob/2c24f13fd99af7ccf29e56d5d936b3ab0f237db6/bases/typescript.js
                "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
                "@typescript-eslint/ban-types": ["error", { types: { null: null } }],
                "@typescript-eslint/no-namespace": ["error", { allowDeclarations: true }],
                "@typescript-eslint/no-require-imports": "off",
                "@typescript-eslint/no-unnecessary-condition": "off",
                "@typescript-eslint/prefer-for-of": "error",
                "@typescript-eslint/prefer-nullish-coalescing": "error",
                "@typescript-eslint/prefer-readonly": "off",
                "@typescript-eslint/quotes": ["error", "double", { avoidEscape: true, allowTemplateLiterals: false }],
                "@typescript-eslint/require-array-sort-compare": "off",
                "@typescript-eslint/camelcase": "off",

                "@typescript-eslint/naming-convention": [
                    "error",
                    {
                        selector: "default",
                        format: ["camelCase"],
                        leadingUnderscore: "allow",
                    },
                    {
                        selector: "variable",
                        format: ["camelCase", "UPPER_CASE"],
                        leadingUnderscore: "allow",
                    },
                    {
                        selector: "typeLike",
                        format: ["PascalCase"],
                    },
                    {
                        selector: "enumMember",
                        format: ["PascalCase"],
                    },
                    {
                        selector: "typeParameter",
                        format: ["PascalCase"],
                        prefix: ["T"],
                        filter: {
                            regex: "K|V",
                            match: false,
                        },
                    },
                    {
                        selector: "interface",
                        format: ["PascalCase"],
                        custom: {
                            regex: "^I[A-Z]",
                            match: false,
                        },
                    },
                ],
            },
        },
        {
            files: "src/lualib/**/*.ts",
            rules: {
                "no-restricted-syntax": ["error", "LabeledStatement", "SequenceExpression"],
                "@typescript-eslint/no-throw-literal": "off",
                "@typescript-eslint/prefer-optional-chain": "off",
                "@typescript-eslint/naming-convention": "off",
            },
        },
        {
            files: "language-extensions/index.d.ts",
            rules: {
                "@typescript-eslint/naming-convention": "off",
            },
        },
        {
            files: "benchmark/src/*_benchmarks/**/*.ts",
            rules: {
                "import/no-default-export": "off",
            },
        },
    ],
};
