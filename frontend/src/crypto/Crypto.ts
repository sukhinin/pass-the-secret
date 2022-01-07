export interface Crypto {
  generateRandom(size: number): Promise<ArrayBuffer>;

  encrypt(key: ArrayBuffer, iv: ArrayBuffer, data: ArrayBuffer): Promise<ArrayBuffer>;

  decrypt(key: ArrayBuffer, iv: ArrayBuffer, data: ArrayBuffer): Promise<ArrayBuffer>;
}
