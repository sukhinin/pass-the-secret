import { StateStore } from "./StateStore";

export class LocalStorageStateStore implements StateStore {

  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  save(state: any) {
    const stateString = JSON.stringify(state);
    window.localStorage.setItem(this.name, stateString);
  }

  restore(): any {
    const stateString = window.localStorage.getItem(this.name);
    return JSON.parse(stateString);
  }
}
