import {
  compareHash,
  generateHash,
} from './hash.utils.js';

describe('hash.utils', () => {
  describe('generateHash', () => {
    it('produces an argon2id hash that verifies against the plaintext', async () => {
      const hash = await generateHash('correct-password');
      expect(hash).toMatch(/^\$argon2id\$/);
      await expect(compareHash('correct-password', hash)).resolves.toBe(true);
    });
  });

  describe('compareHash', () => {
    it('returns false for a wrong plaintext', async () => {
      const hash = await generateHash('correct-password');
      await expect(compareHash('wrong-password', hash)).resolves.toBe(false);
    });

    it('returns false instead of throwing when the hash is not argon2id', async () => {
      await expect(compareHash('password', 'plaintext-not-a-hash')).resolves.toBe(
        false,
      );
      await expect(compareHash('password', '')).resolves.toBe(false);
    });
  });
});