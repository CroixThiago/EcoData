import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
    test: {
        environment: "jsdom",
        globals: true,
        include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
        exclude: ["node_modules", ".next"],
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            include: ["lib/**/*.ts", "app/api/**/*.ts"],
            exclude: ["node_modules", ".next", "tests"],
        },
        setupFiles: ["tests/setup.ts"],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
})
