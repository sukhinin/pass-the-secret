import { StateStore } from "./StateStore";

export class CreateSecretSection {

  private readonly root: HTMLElement;
  private readonly stateStore?: StateStore;
  private readonly fieldset: HTMLFieldSetElement;
  private readonly secretInput: HTMLTextAreaElement;
  private readonly daysInput: HTMLSelectElement;
  private readonly showPasswordGeneratorButton: HTMLButtonElement;
  private readonly submitSecretButton: HTMLButtonElement;
  private readonly browserEncryptionUnavailableWarning: HTMLElement;

  onShowPasswordGenerator: () => void;
  onSubmitSecret: (secret: string, days: number) => Promise<void>;

  constructor(root: HTMLElement, stateStore?: StateStore) {
    this.root = root;
    this.stateStore = stateStore;

    this.fieldset = root.querySelector("fieldset");
    this.secretInput = root.querySelector("[data-id='secret']");
    this.daysInput = root.querySelector("[data-id='days']");
    this.showPasswordGeneratorButton = root.querySelector("[data-id='show-password-generator']");
    this.submitSecretButton = root.querySelector("[data-id='submit-secret']");
    this.browserEncryptionUnavailableWarning = root.querySelector("[data-id='browser-encryption-unavailable-warning']");

    this.restoreUserInterfaceState();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.fieldset.onchange = () => {
      this.saveUserInterfaceState();
    };
    this.showPasswordGeneratorButton.onclick = () => {
      if (this.onShowPasswordGenerator) {
        this.onShowPasswordGenerator();
      }
    };
    this.submitSecretButton.onclick = async () => {
      if (this.onSubmitSecret) {
        try {
          this.submitSecretButton.disabled = true;
          const secret = this.secretInput.value;
          const days = parseInt(this.daysInput.value);
          await this.onSubmitSecret(secret, days);
        } finally {
          this.submitSecretButton.disabled = false;
        }
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
    this.secretInput.focus();
  }

  hide() {
    this.secretInput.value = "";
    this.root.classList.add("hidden");
  }

  showBrowserEncryptionUnavailableWarning() {
    this.browserEncryptionUnavailableWarning.classList.remove("hidden");
  }

  hidePasswordGeneratorButton() {
    this.showPasswordGeneratorButton.classList.add("hidden");
  }

  private saveUserInterfaceState() {
    try {
      this.stateStore?.save({
        days: this.daysInput.value
      });
    } catch {
      // This is not crucial for operation, ignore any errors.
    }
  }

  private restoreUserInterfaceState() {
    try {
      const state = this.stateStore?.restore();
      this.daysInput.value = state?.days === undefined ? 3 : state.days;
    } catch {
      // This is not crucial for operation, ignore any errors.
    }
  }
}
