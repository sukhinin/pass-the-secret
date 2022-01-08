import { Crypto } from "./Crypto";

export class BrowserCrypto implements Crypto {

  constructor() {
    if (!BrowserCrypto.isSupported()) {
      throw new Error("Browser Crypto API is not supported.");
    }
  }

  async generateRandom(size: number): Promise<ArrayBuffer> {
    const array = new Uint8Array(size);
    crypto.getRandomValues(array);
    return array.buffer;
  }

  async encrypt(key: ArrayBuffer, iv: ArrayBuffer, data: ArrayBuffer): Promise<ArrayBuffer> {
    const algorithm = { name: "AES-CBC", iv: iv };
    const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["encrypt"]);
    return await crypto.subtle.encrypt(algorithm, cryptoKey, data);
  }

  async decrypt(key: ArrayBuffer, iv: ArrayBuffer, data: ArrayBuffer): Promise<ArrayBuffer> {
    const algorithm = { name: "AES-CBC", iv: iv };
    const cryptoKey = await crypto.subtle.importKey("raw", key, "AES-CBC", false, ["decrypt"]);
    return await crypto.subtle.decrypt(algorithm, cryptoKey, data);
  }

  static isSupported(): boolean {
    const cryptoApiFunctions = [
      crypto?.getRandomValues,
      crypto?.subtle?.importKey,
      crypto?.subtle?.exportKey,
      crypto?.subtle?.encrypt,
      crypto?.subtle?.decrypt
    ];
    return cryptoApiFunctions.every(f => typeof f === "function");
  }
}
