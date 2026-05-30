import * as Crypto from 'expo-crypto';

/**
 * ULID generator using `expo-crypto` for entropy.
 *
 * Crockford base32, 26 chars, lexicographically sortable by time.
 * See https://github.com/ulid/spec.
 */
const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ENCODING_LEN = ENCODING.length;
const TIME_LEN = 10;
const RANDOM_LEN = 16;

function encodeTime(now: number): string {
  let out = '';
  let n = now;
  for (let i = TIME_LEN; i > 0; i--) {
    const mod = n % ENCODING_LEN;
    out = ENCODING.charAt(mod) + out;
    n = (n - mod) / ENCODING_LEN;
  }
  return out;
}

function encodeRandom(): string {
  const bytes = Crypto.getRandomBytes(RANDOM_LEN);
  let out = '';
  for (let i = 0; i < RANDOM_LEN; i++) {
    out += ENCODING.charAt(bytes[i] % ENCODING_LEN);
  }
  return out;
}

export function ulid(): string {
  return encodeTime(Date.now()) + encodeRandom();
}
