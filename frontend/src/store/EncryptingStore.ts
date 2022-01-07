import { Store, StoreRef } from "./Store";
import { Crypto } from "../crypto";
import { decodeBase64, encodeBase64 } from "../utils/base64";
import { ApiError, post } from "../api";

const ZERO_IV = new Uint8Array(16).buffer;

export class EncryptingStore implements Store {

  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();
  private readonly crypto: Crypto;

  constructor(crypto: Crypto) {
    this.crypto = crypto;
  }

  async put(data: string, days: number): Promise<StoreRef> {
    const bytes = this.encoder.encode(data);
    const key = await this.crypto.generateRandom(32);
    const encrypted = await this.crypto.encrypt(key, ZERO_IV, bytes.buffer);

    const request = { data: encodeBase64(encrypted), days: days };
    const response = await post("/api/encrypted/put", request);

    return { id: response.id, key: encodeBase64(key) };
  }

  async get(ref: StoreRef): Promise<string | null> {
    try {
      const request = { id: ref.id };
      const response = await post("/api/encrypted/get", request);

      const bytes = await this.crypto.decrypt(decodeBase64(ref.key), ZERO_IV, decodeBase64(response.data));
      return this.decoder.decode(bytes);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        return null;
      }
      throw e;
    }
  }
}
