import crypto from "crypto"

const DEFAULT_IV_LENGTH = 12 // gcm

function getKey() {
  const key = process.env.IBAN_ENC_KEY
  if (!key || key.length < 32) {
    throw new Error("IBAN_ENC_KEY must be at least 32 characters")
  }
  return Buffer.from(key.slice(0, 32))
}

export function encryptIban(plain: string) {
  const iv = crypto.randomBytes(DEFAULT_IV_LENGTH)
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

export function decryptIban(enc: string) {
  const buf = Buffer.from(enc, "base64")
  const iv = buf.subarray(0, DEFAULT_IV_LENGTH)
  const tag = buf.subarray(DEFAULT_IV_LENGTH, DEFAULT_IV_LENGTH + 16)
  const data = buf.subarray(DEFAULT_IV_LENGTH + 16)
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
  return decrypted.toString("utf8")
}
