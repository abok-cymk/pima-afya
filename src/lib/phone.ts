const INTERNATIONAL_PHONE = /^\+254(7\d{8}|1\d{8})$/
const LOCAL_PHONE = /^(07\d{8}|01\d{8})$/

export function normalizeKenyanPhone(
  input: string
): { ok: true; e164: string } | { ok: false; reason: 'country' | 'format' } {
  const trimmed = input.trim()

  if (!trimmed) {
    return { ok: false, reason: 'format' }
  }

  if (trimmed.startsWith('+') && !trimmed.startsWith('+254')) {
    return { ok: false, reason: 'country' }
  }

  if (INTERNATIONAL_PHONE.test(trimmed)) {
    return { ok: true, e164: trimmed }
  }

  if (LOCAL_PHONE.test(trimmed)) {
    return { ok: true, e164: `+254${trimmed.slice(1)}` }
  }

  if (trimmed.startsWith('+254')) {
    return { ok: false, reason: 'format' }
  }

  return { ok: false, reason: 'format' }
}