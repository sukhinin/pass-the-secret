export type StoreRef = { id: string, key: string };

export interface Store {
  put(data: string, days: number): Promise<StoreRef>;

  get(ref: StoreRef): Promise<string | null>;
}
