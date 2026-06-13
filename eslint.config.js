import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**", "icons/**", "_locales/**", "**/*.md"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        ...globals.browser,
        chrome: "readonly",
        importScripts: "readonly",
        NovelPublisherStorage: "readonly",
        NovelPublisherI18n: "readonly",
        NovelPublisherParser: "readonly",
        NovelPublisherUtils: "readonly",
        FanqieAdapter: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_", varsIgnorePattern: "^_", vars: "local" }],
      "no-redeclare": "warn",
      "no-undef": "error",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-fallthrough": ["warn", { commentPattern: "break\\s*omitted" }],
      "no-constant-condition": "warn",
      "no-self-compare": "error",
      "no-unreachable": "warn",
      "no-async-promise-executor": "off",
      "no-console": "off",
      "no-alert": "off",
      "eqeqeq": ["warn", "always", { null: "ignore" }],
      "curly": ["warn", "multi-line"],
      "no-global-assign": "error",
      "no-shadow": "off",
      "no-use-before-define": "off",
      "no-prototype-builtins": "off",
      "semi": ["warn", "always"],
      "no-extra-semi": "warn"
    }
  },
  {
    files: ["shared/parser.test.cjs"],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        process: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly"
      }
    }
  }
];
