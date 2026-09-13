/* oxlint-disable */
import { globSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

// TODO: replace createRequire with async import() + pathToFileURL (pure ESM);
// kept sync so queue.module.ts providers don't change in this migration.
const require = createRequire(import.meta.url);

const __dirname = import.meta.dirname;

/**
 * Load all BullMQ processor classes declared under the queue directory.
 *
 * Any file matching the processor pattern ts or js under the queue tree is
 * required, and every class export is registered as a provider. Keep helper
 * functions and DTOs out of .processor.ts files to avoid registering
 * unintended providers.
 */
export function loadProcessors(): any[] {
  const extension = import.meta.filename.endsWith('.ts') ? 'ts' : 'js';
  const files = globSync(`**/*.processor.${extension}`, {
    cwd: __dirname,
  });

  const processors: any[] = [];
  for (const file of files) {
    const module = require(resolve(__dirname, file));
    for (const exported of Object.values(module)) {
      if (typeof exported === 'function' && exported.prototype) {
        processors.push(exported);
      }
    }
  }
  return processors;
}
