export interface StateStore {
  save(state: any);

  restore(): any;
}
