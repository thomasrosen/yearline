export async function getSha512Hash(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// // Example usage
// const text = 'Hello, World!';
// const hash = getSha512Hash(text);
