import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  mkdtempSync,
  rmSync,
  existsSync,
  readFileSync,
  mkdirSync,
  readdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProject } from './generator.js';

const REPO_TEMPLATES = new URL('../../templates', import.meta.url).pathname;

describe('createProject', () => {
  let tempRoot: string;
  let targetDir: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'nestforge-test-'));
    targetDir = join(tempRoot, 'project');
  });

  afterEach(() => {
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('scaffolds a rest project from templates', async () => {
    await createProject({
      projectName: 'rest-app',
      targetDir,
      variant: 'rest',
      templatesDir: REPO_TEMPLATES,
    });

    expect(existsSync(join(targetDir, 'package.json'))).toBe(true);
    expect(existsSync(join(targetDir, '.env'))).toBe(true);
    expect(existsSync(join(targetDir, 'src', 'main.ts'))).toBe(true);
    const pkg = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('rest-app');
    expect(pkg.type).toBe('module');
    expect(existsSync(join(targetDir, 'vitest.config.ts'))).toBe(true);
    expect(existsSync(join(targetDir, 'test', 'jest-e2e.json'))).toBe(false);
  });

  it('scaffolds a graphql project with merged dependencies', async () => {
    await createProject({
      projectName: 'gql-app',
      targetDir,
      variant: 'graphql',
      templatesDir: REPO_TEMPLATES,
    });

    expect(existsSync(join(targetDir, 'package.json'))).toBe(true);
    expect(
      existsSync(join(targetDir, 'src', 'core', 'authentication', 'authentication.resolver.ts')),
    ).toBe(true);
    const pkg = JSON.parse(readFileSync(join(targetDir, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('gql-app');
    expect(pkg.dependencies).toHaveProperty('@nestjs/graphql');
    expect(pkg.type).toBe('module');
  });

  it('throws when target directory already exists', async () => {
    mkdirSync(targetDir, { recursive: true });
    await expect(
      createProject({
        projectName: 'dupe',
        targetDir,
        variant: 'rest',
        templatesDir: REPO_TEMPLATES,
      }),
    ).rejects.toThrow(/already exists/);
  });

  it('initializes a git repository when initGit is set', async () => {
    await createProject({
      projectName: 'git-app',
      targetDir,
      variant: 'rest',
      templatesDir: REPO_TEMPLATES,
      initGit: true,
    });

    expect(readdirSync(join(targetDir, '.git'))).toContain('HEAD');
  });

  it('skips git initialization by default', async () => {
    await createProject({
      projectName: 'no-git-app',
      targetDir,
      variant: 'rest',
      templatesDir: REPO_TEMPLATES,
    });

    expect(existsSync(join(targetDir, '.git'))).toBe(false);
  });

  it('keeps all oauth env vars when oauthProviders is undefined', async () => {
    await createProject({
      projectName: 'oauth-default',
      targetDir,
      variant: 'rest',
      templatesDir: REPO_TEMPLATES,
    });

    const env = readFileSync(join(targetDir, '.env'), 'utf8');
    expect(env).toContain('GOOGLE_OAUTH_CLIENT_ID');
    expect(env).not.toContain('GITHUB_OAUTH_CLIENT_ID');
  });

  it('keeps only selected oauth provider env vars', async () => {
    await createProject({
      projectName: 'oauth-google',
      targetDir,
      variant: 'rest',
      templatesDir: REPO_TEMPLATES,
      oauthProviders: ['google'],
    });

    const env = readFileSync(join(targetDir, '.env'), 'utf8');
    expect(env).toContain('GOOGLE_OAUTH_CLIENT_ID');
    expect(env).not.toContain('GITHUB_OAUTH_CLIENT_ID');
  });

  it('strips all oauth env vars when oauthProviders is empty', async () => {
    await createProject({
      projectName: 'oauth-none',
      targetDir,
      variant: 'rest',
      templatesDir: REPO_TEMPLATES,
      oauthProviders: [],
    });

    const env = readFileSync(join(targetDir, '.env'), 'utf8');
    expect(env).not.toContain('GOOGLE_OAUTH_CLIENT_ID');
    expect(env).not.toContain('GITHUB_OAUTH_CLIENT_ID');
  });
});
