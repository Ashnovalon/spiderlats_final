module.exports = {
  extends: ["next/core-web-vitals"],
  overrides: [
    {
      files: ["server/**/*.js"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
