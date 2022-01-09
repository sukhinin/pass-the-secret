export class SecretContentsSection {

  private readonly root: HTMLElement;
  private readonly secret: HTMLTextAreaElement;
  private readonly copySecretButton: HTMLButtonElement;

  onCopySecret: (secret: string) => Promise<void>;

  constructor(root: HTMLElement) {
    this.root = root;
    this.secret = root.querySelector("[data-id='secret']");
    this.copySecretButton = root.querySelector("[data-id='copy-secret']");
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.copySecretButton.onclick = async () => {
      if (this.onCopySecret) {
        try {
          this.copySecretButton.disabled = true;
          const secret = this.secret.value;
          await this.onCopySecret(secret);
        } finally {
          this.copySecretButton.disabled = false;
        }
      }
    };
  }

  show(secret: string) {
    this.secret.value = secret;
    this.root.classList.remove("hidden");
    this.copySecretButton.focus();
  }

  hide() {
    this.secret.value = "";
    this.root.classList.add("hidden");
  }
}
