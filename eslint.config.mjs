import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Export array with ignores as first element, then config
export default [
  {
    ignores: [
      "app/generated/",
      "node_modules/",
      ".next/",
      "out/",
      "dist/",
      "*.min.js",
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];
