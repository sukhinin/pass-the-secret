export class SecretContentsSection {

  private readonly root: HTMLElement;
  private readonly secret: HTMLTextAreaElement;
  private readonly copySecretButton: HTMLButtonElement;

  onCopySecret: (secret: string) => void;

  constructor(root: HTMLElement) {
    this.root = root;
    this.secret = root.querySelector("[data-id='secret']");
    this.copySecretButton = root.querySelector("[data-id='copy-secret']")
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.copySecretButton.onclick = () => {
      if (this.onCopySecret) {
        const secret = this.secret.value;
        this.onCopySecret(secret);
      }
    }
  }

  show(secret: string) {
    this.secret.value = secret;
    this.root.classList.remove("hidden");
  }

  hide() {
    this.secret.value = "";
    this.root.classList.add("hidden");
  }
}
