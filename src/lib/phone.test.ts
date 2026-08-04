import { expect, test, describe } from 'vitest';
import { normalizeKenyanPhone } from './phone';

describe('normalizeKenyanPhone', () => {
  test('keeps valid Kenyan international numbers unchanged', () => {
    expect(normalizeKenyanPhone('+254712345678')).toEqual({ ok: true, e164: '+254712345678' });
    expect(normalizeKenyanPhone('+254112345678')).toEqual({ ok: true, e164: '+254112345678' });
  });

  test('normalizes local Kenyan numbers to E.164', () => {
    expect(normalizeKenyanPhone('0712345678')).toEqual({ ok: true, e164: '+254712345678' });
    expect(normalizeKenyanPhone('0112345678')).toEqual({ ok: true, e164: '+254112345678' });
  });

  test('rejects other country codes', () => {
    expect(normalizeKenyanPhone('+256712345678')).toEqual({ ok: false, reason: 'country' });
  });

  test('rejects malformed numbers', () => {
    expect(normalizeKenyanPhone('12345')).toEqual({ ok: false, reason: 'format' });
    expect(normalizeKenyanPhone('+254812345678')).toEqual({ ok: false, reason: 'format' });
  });
});