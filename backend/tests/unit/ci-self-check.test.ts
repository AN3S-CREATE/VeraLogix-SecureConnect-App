import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Lightweight CI self-check: ensures package metadata the workflows rely on stays intact.
 */
describe('CI self-check', () => {
  it('exposes required npm scripts', () => {
    const root = JSON.parse(readFileSync(resolve(__dirname, '../../../package.json'), 'utf8')) as {
      scripts: Record<string, string>;
      workspaces: string[];
    };
    const api = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };

    expect(root.workspaces).toEqual(expect.arrayContaining(['backend', 'packages/sdk']));
    expect(root.scripts.typecheck).toBeTruthy();
    expect(api.scripts.typecheck).toBeTruthy();
    expect(api.scripts.test).toBeTruthy();
    expect(api.scripts['test:coverage']).toBeTruthy();
  });
});
