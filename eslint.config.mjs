import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Disable Tailwind CSS v4 migration warnings - these are just suggestions
      "@next/next/no-class-validation": "off",
      
      // Allow 'any' types in specific cases (Prisma data, form resolvers)
      // Downgrade from error to off since we're working with dynamic Prisma data
      "@typescript-eslint/no-explicit-any": "off",
      
      // Disable other non-critical warnings
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;

