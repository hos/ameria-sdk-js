module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["prettier"],
  extends: ["prettier", "plugin:prettier/recommended"],
  rules: {
    "prettier/prettier": "error",
  },
};
