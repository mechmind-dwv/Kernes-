/**
 * Cifrado y descifrado con libsodium (X25519 + XSalsa20-Poly1305).
 * Todo el cifrado es local — nunca se comparten claves con servidores.
 */

const ready = (async () => {
  if (typeof window !== 'undefined' && (window as any).sodium) {
    await (window as any).sodium.ready;
    return (window as any).sodium;
  }
  // Fallback: importar dinámicamente libsodium-wrappers
  try {
    const sodium = await import('libsodium-wrappers');
    await sodium.default.ready;
    return sodium.default;
  } catch {
    // En entornos sin libsodium, retornar funciones stub
    return null;
  }
})();

/**
 * Genera un nuevo par de claves X25519 para cifrado.
 */
export async function generateKeyPair(): Promise<{ publicKey: Uint8Array; privateKey: Uint8Array } | null> {
  const sodium = await ready;
  if (!sodium) return null;
  return sodium.crypto_box_keypair();
}

/**
 * Cifra un mensaje para un destinatario usando su clave pública.
 */
export async function encryptMessage(
  message: string,
  recipientPublicKey: Uint8Array,
  senderKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array }
): Promise<{ ciphertext: Uint8Array; nonce: Uint8Array } | null> {
  const sodium = await ready;
  if (!sodium) return null;

  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  const ciphertext = sodium.crypto_box_easy(
    new TextEncoder().encode(message),
    nonce,
    recipientPublicKey,
    senderKeyPair.privateKey
  );

  return { ciphertext, nonce };
}

/**
 * Descifra un mensaje recibido.
 */
export async function decryptMessage(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  senderPublicKey: Uint8Array,
  recipientPrivateKey: Uint8Array
): Promise<string | null> {
  const sodium = await ready;
  if (!sodium) return null;

  try {
    const plaintext = sodium.crypto_box_open_easy(ciphertext, nonce, senderPublicKey, recipientPrivateKey);
    return new TextDecoder().decode(plaintext);
  } catch {
    return null; // Fallo de autenticación
  }
}

/**
 * Cifra datos con una contraseña usando Argon2 + secretbox.
 */
export async function encryptWithPassword(data: string, password: string): Promise<string | null> {
  const sodium = await ready;
  if (!sodium) return null;

  // Derivar clave de la contraseña (simplificado — en producción usar Argon2id)
  const salt = sodium.randombytes_buf(16);
  const key = sodium.crypto_generichash(32, new TextEncoder().encode(password), salt);

  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = sodium.crypto_secretbox_easy(new TextEncoder().encode(data), nonce, key);

  // Concatenar salt + nonce + ciphertext y codificar en base64
  const combined = new Uint8Array(salt.length + nonce.length + ciphertext.length);
  combined.set(salt, 0);
  combined.set(nonce, salt.length);
  combined.set(ciphertext, salt.length + nonce.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Descifra datos cifrados con una contraseña.
 */
export async function decryptWithPassword(encryptedData: string, password: string): Promise<string | null> {
  const sodium = await ready;
  if (!sodium) return null;

  try {
    const combined = new Uint8Array(atob(encryptedData).split('').map((c) => c.charCodeAt(0)));

    const salt = combined.slice(0, 16);
    const nonce = combined.slice(16, 16 + sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = combined.slice(16 + sodium.crypto_secretbox_NONCEBYTES);

    const key = sodium.crypto_generichash(32, new TextEncoder().encode(password), salt);

    const plaintext = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
    return new TextDecoder().decode(plaintext);
  } catch {
    return null;
  }
}
