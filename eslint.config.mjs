import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist/", "docs/", ".yarn/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ["test/**/*.mjs"],
    languageOptions: {
      globals: {
        fetch: "writable",
        Response: "readonly",
        AbortSignal: "readonly",
      },
    },
  },
);
