import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'json'],
      // Limit enforcement to modules exercised by the unit suite.
      include: [
        'src/lib/cache.ts',
        'src/lib/errors.ts',
        'src/lib/keycloak-admin.ts',
        'src/lib/pagination.ts',
        'src/lib/roles.ts',
        'src/lib/utils.ts',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 40,
        statements: 50,
      },
    },
  },
});
