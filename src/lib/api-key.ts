import { randomBytes, createHash, randomInt } from 'crypto'

export function generateApiKey() {
  return randomBytes(32).toString('base64url')
}

export function hashApiKey(key: string) {
  return createHash('sha256').update(key).digest('hex')
}

const PAIRING_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generatePairingCode() {
  return Array.from({ length: 6 }, () => PAIRING_CODE_ALPHABET[randomInt(PAIRING_CODE_ALPHABET.length)]).join('')
}
