export class CreateSecretSection {
  private readonly root: HTMLElement;
  private readonly fieldset: HTMLFieldSetElement;
  private readonly secretInput: HTMLTextAreaElement;
  private readonly daysInput: HTMLSelectElement;
  private readonly showPasswordGeneratorButton: HTMLButtonElement;
  private readonly createSecretButton: HTMLButtonElement;
  private readonly browserEncryptionUnavailableWarning: HTMLElement;

  onShowPasswordGenerator: () => void;
  onCreateSecret: (secret: string, days: number) => void;

  constructor(root: HTMLElement) {
    this.root = root;
    this.fieldset = root.querySelector("fieldset");
    this.secretInput = root.querySelector("[data-id='secret']");
    this.daysInput = root.querySelector("[data-id='days']");
    this.showPasswordGeneratorButton = root.querySelector("[data-id='show-password-generator']");
    this.createSecretButton = root.querySelector("[data-id='create-secret']");
    this.browserEncryptionUnavailableWarning = root.querySelector("[data-id='browser-encryption-unavailable-warning']");
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.showPasswordGeneratorButton.onclick = () => {
      if (this.onShowPasswordGenerator) {
        this.onShowPasswordGenerator();
      }
    };
    this.createSecretButton.onclick = () => {
      if (this.onCreateSecret) {
        const secret = this.secretInput.value;
        const days = parseInt(this.daysInput.selectedOptions[0].value);
        this.onCreateSecret(secret, days);
      }
    };
  }

  enable() {
    this.fieldset.disabled = false;
  }

  disable() {
    this.fieldset.disabled = true;
  }

  show() {
    this.root.classList.remove("hidden");
  }

  hide() {
    this.secretInput.value = "";
    this.root.classList.add("hidden");
  }

  showBrowserEncryptionUnavailableWarning() {
    this.browserEncryptionUnavailableWarning.classList.remove("hidden");
  }

  disablePasswordGenerationFeature() {
    this.showPasswordGeneratorButton.classList.add("hidden");
  }
}
