/**
 * Firmas digitales con Ed25519.
 * Para verificación de identidad, integridad de datos y firmas de releases.
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
 * Genera un par de claves Ed25519 para firmas.
 */
export async function generateSigningKeyPair(): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array } | null> {
  const sodium = await getSodium();
  if (!sodium) return null;
  return sodium.crypto_sign_keypair();
}

/**
 * Firma un mensaje con la clave privada.
 */
export async function signMessage(message: string, privateKey: Uint8Array): Promise<Uint8Array | null> {
  const sodium = await getSodium();
  if (!sodium) return null;
  return sodium.crypto_sign(new TextEncoder().encode(message), privateKey);
}

/**
 * Verifica una firma.
 */
export async function verifySignature(
  signedMessage: Uint8Array,
  publicKey: Uint8Array
): Promise<string | null> {
  const sodium = await getSodium();
  if (!sodium) return null;

  try {
    const result = sodium.crypto_sign_open(signedMessage, publicKey);
    return new TextDecoder().decode(result);
  } catch {
    return null; // Firma inválida
  }
}

/**
 * Deriva una clave Ed25519 desde una seedphrase (BIP39).
 * Permite recuperar la misma clave desde la frase mnemónica.
 */
export async function deriveKeyFromSeedPhrase(seedPhrase: string): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array } | null> {
  const sodium = await getSodium();
  if (!sodium) return null;

  // Derivar seed desde la frase usando un hash generico
  const seed = sodium.crypto_generichash(32, new TextEncoder().encode(seedPhrase));

  // Generar clave Ed25519 desde la seed
  return sodium.crypto_sign_seed_keypair(seed);
}
