import { Store, StoreRef } from "./Store";
import { decodeBase64, encodeBase64 } from "../utils/base64";
import { ApiError, post } from "../api";
import { ApplicationError } from "../ApplicationError";

export class PlainStore implements Store {

  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  async put(data: string, days: number): Promise<StoreRef> {
    try {
      const bytes = this.encoder.encode(data);
      const encoded = encodeBase64(bytes.buffer);

      const request = { data: encoded, days: days };
      const response = await post("/api/plain/put", request);

      return { id: response.id, key: response.key };
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        throw new ApplicationError("Server-side encryption is disabled by administrator.", e);
      }
      throw e;
    }
  }

  async get(ref: StoreRef): Promise<string | null> {
    try {
      const request = { id: ref.id, key: ref.key };
      const response = await post("/api/plain/get", request);

      const bytes = decodeBase64(response.data);
      return this.decoder.decode(bytes);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        throw new ApplicationError("Server-side decryption is disabled by administrator.", e);
      }
      if (e instanceof ApiError && e.status === 404) {
        return null;
      }
      throw e;
    }
  }
}
