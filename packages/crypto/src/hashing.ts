/**
 * Funciones de hashing criptográfico.
 * SHA-256, BLAKE2b y utilidades de verificación de integridad.
 */

let sodiumInstance: any = null;

async function getSodium() {
  if (sodiumInstance) return sodiumInstance;
  try {
    const sodium = await import('libsodium-wrappers');
    await sodium.default.ready;
    sodiumInstance = sodium.default;
    return sodiumInstance;
  } catch {
    return null;
  }
}

/**
 * Calcula SHA-256 de un string o Uint8Array.
 */
export async function sha256(data: string | Uint8Array): Promise<Uint8Array | null> {
  const sodium = await getSodium();
  if (!sodium) return null;

  const input = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  return sodium.crypto_hash_sha256(input);
}

/**
 * Calcula BLAKE2b de un string o Uint8Array.
 */
export async function blake2b(data: string | Uint8Array, key?: Uint8Array): Promise<Uint8Array | null> {
  const sodium = await getSodium();
  if (!sodium) return null;

  const input = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  if (key) {
    return sodium.crypto_generichash(32, input, key);
  }
  return sodium.crypto_generichash(32, input);
}

/**
 * Convierte un hash a string hexadecimal.
 */
export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Genera un hash seguro para identificar datos sin revelarlos.
 * Usado para rate limiting y estadísticas agregadas (zero-knowledge).
 */
export async function hashForIdentifier(data: string): Promise<string | null> {
  const hash = await blake2b(data);
  if (!hash) return null;
  // Devolver solo los primeros 16 caracteres (suficiente para estadísticas)
  return toHex(hash).slice(0, 16);
}
