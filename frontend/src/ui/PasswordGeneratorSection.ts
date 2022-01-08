import { PasswordConstraints } from "../passwords/PasswordGenerator";

export class PasswordGeneratorSection {

  private readonly root: HTMLElement;
  private readonly document: HTMLDocument;
  private readonly fieldset: HTMLFieldSetElement;
  private readonly generatePasswordButton: HTMLButtonElement;
  private readonly copyPasswordButton: HTMLButtonElement;
  private readonly lowercaseLettersCheckbox: HTMLInputElement;
  private readonly uppercaseLettersCheckbox: HTMLInputElement;
  private readonly digitsCheckbox: HTMLInputElement;
  private readonly specialCharactersCheckbox: HTMLInputElement;
  private readonly passwordLengthInput: HTMLInputElement;
  private readonly password: HTMLInputElement;
  private readonly keyDownHandler: (e: KeyboardEvent) => void;

  onHidePasswordGenerator: () => void;
  onGeneratePassword: (constraints: PasswordConstraints) => void;
  onCopyPassword: (password: string) => void;

  constructor(root: HTMLElement) {
    this.root = root;
    this.document = root.ownerDocument;
    this.fieldset = root.querySelector("fieldset");
    this.generatePasswordButton = root.querySelector("[data-id='generate-password']");
    this.copyPasswordButton = root.querySelector("[data-id='copy-password']")
    this.lowercaseLettersCheckbox = root.querySelector("[data-id='lowercase-letters']");
    this.uppercaseLettersCheckbox = root.querySelector("[data-id='uppercase-letters']");
    this.digitsCheckbox = root.querySelector("[data-id='digits']");
    this.specialCharactersCheckbox = root.querySelector("[data-id='special-characters']");
    this.passwordLengthInput = root.querySelector("[data-id='password-length']");
    this.password = root.querySelector("[data-id='password']");
    this.keyDownHandler = (e) => this.handleKeyDown(e);
    this.restoreUserInterfaceState();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.root.onclick = (e) => {
      if (this.onHidePasswordGenerator && e.target === this.root) {
        this.onHidePasswordGenerator();
      }
    }
    this.fieldset.onchange = () => {
      this.generatePasswordButton.click();
      this.saveUserInterfaceState();
    };
    this.generatePasswordButton.onclick = () => {
      if (this.onGeneratePassword) {
        const constraints = this.getPasswordConstraints();
        this.onGeneratePassword(constraints);
      }
    }
    this.copyPasswordButton.onclick = () => {
      if (this.onCopyPassword) {
        const password = this.password.value;
        this.onCopyPassword(password);
      }
    }
  }

  private getPasswordConstraints(): PasswordConstraints {
    const maxPasswordLength = parseInt(this.passwordLengthInput.max) || 30;
    const minPasswordLength = parseInt(this.passwordLengthInput.min) || 8;
    const passwordLength = parseInt(this.passwordLengthInput.value) || 16;

    const length = Math.max(minPasswordLength, Math.min(maxPasswordLength, passwordLength))
    if (length.toString() != this.passwordLengthInput.value) {
      this.passwordLengthInput.value = length.toString();
    }

    return {
      length: length,
      lowercaseLetters: this.lowercaseLettersCheckbox.checked,
      uppercaseLetters: this.uppercaseLettersCheckbox.checked,
      digits: this.digitsCheckbox.checked,
      specialCharacters: this.specialCharactersCheckbox.checked
    };
  }

  setPassword(password: string) {
    this.password.value = password;
  }

  show() {
    this.document.addEventListener("keydown", this.keyDownHandler);
    this.root.classList.remove("hidden");
    this.generatePasswordButton.click();
  }

  hide() {
    this.document.removeEventListener("keydown", this.keyDownHandler);
    this.root.classList.add("hidden");
    this.password.value = "";
  }

  enable() {
    this.fieldset.disabled = false;
  }

  disable() {
    this.fieldset.disabled = true;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation()
      if (this.onHidePasswordGenerator) {
        this.onHidePasswordGenerator();
      }
    }
  }

  private saveUserInterfaceState() {
    try {
      const state = {
        passwordLength: this.passwordLengthInput.value,
        lowercaseLetters: this.lowercaseLettersCheckbox.checked,
        uppercaseLetters: this.uppercaseLettersCheckbox.checked,
        digits: this.digitsCheckbox.checked,
        specialCharacters: this.specialCharactersCheckbox.checked
      };
      const data = JSON.stringify(state);
      window.localStorage.setItem("password-generator-section", data);
    } catch {
      // This is not crucial for operation, ignore any errors.
    }
  }

  private restoreUserInterfaceState() {
    try {
      const data = window.localStorage.getItem("password-generator-section");
      const state = JSON.parse(data);
      this.passwordLengthInput.value = state.passwordLength === undefined ? 12 : state.passwordLength;
      this.lowercaseLettersCheckbox.checked = state.lowercaseLetters === undefined ? true : state.lowercaseLetters;
      this.uppercaseLettersCheckbox.checked = state.uppercaseLetters === undefined ? true : state.uppercaseLetters;
      this.digitsCheckbox.checked = state.digits === undefined ? true : state.digits;
      this.specialCharactersCheckbox.checked = state.specialCharacters === undefined ? true : state.specialCharacters;
    } catch {
      // This is not crucial for operation, ignore any errors.
    }
  }
}
