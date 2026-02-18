/** @type {import("eslint").Linter.Config[]} */
module.exports = {
  rules: {
    // No unused variables — allow leading-underscore to signal intentional ignoring
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    // Enforce `import type` for type-only imports
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    // Warn on explicit `any` — don't error so it's fixable incrementally
    "@typescript-eslint/no-explicit-any": "warn",
  },
};
