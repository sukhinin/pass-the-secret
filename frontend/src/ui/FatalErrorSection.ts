export class FatalErrorSection {
  private readonly root: HTMLElement;
  private readonly errorTextElement: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.errorTextElement = root.querySelector("[data-id='error-text']");
  }

  show(message?: string) {
    this.errorTextElement.innerText = message ? message : "Something went horribly wrong!";
    this.root.classList.remove("hidden");
  }

  hide() {
    this.root.classList.add("hidden");
  }
}
