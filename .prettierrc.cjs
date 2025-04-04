module.exports = {
  printWidth: 100,
  trailingComma: "all",
  overrides: [
    {
      files: [
        "docs/**/*.md",
        "docs/src/pages/**/*.{js,tsx}",
        "docs/data/**/*.{js,tsx}",
      ],
      options: {
        printWidth: 85,
      },
    },
    {
      files: ["docs/pages/blog/**/*.md"],
      options: {
        printWidth: 82,
      },
    },
  ],
};