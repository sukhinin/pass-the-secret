import { CreateSecretSection } from "./CreateSecretSection";
import { SecretLinkSection } from "./SecretLinkSection";
import { SecretContentsSection } from "./SecretContentsSection";
import { FatalErrorSection } from "./FatalErrorSection";
import { PasswordGeneratorSection } from "./PasswordGeneratorSection";
import { PasswordConstraints } from "../passwords/PasswordGenerator";
import { NotificationsSection } from "./NotificationsSection";
import { LocalStorageStateStore } from "./LocalStorageStateStore";

export class UserInterface {
  private readonly createSecretSection: CreateSecretSection;
  private readonly secretLinkSection: SecretLinkSection;
  private readonly secretContentsSection: SecretContentsSection;
  private readonly fatalErrorSection: FatalErrorSection;
  private readonly passwordGeneratorSection: PasswordGeneratorSection;
  private readonly notificationsSection: NotificationsSection;

  onSubmitSecret: (secret: string, days: number) => void;
  onCopyLink: (link: string) => void;
  onCopySecret: (secret: string) => void;
  onGeneratePassword: (constraints: PasswordConstraints) => void;
  onCopyPassword: (password: string) => void;

  constructor(document: Document) {
    this.createSecretSection = new CreateSecretSection(document.getElementById("create-secret-section"), new LocalStorageStateStore("create-secret-section"));
    this.secretLinkSection = new SecretLinkSection(document.getElementById("secret-link-section"));
    this.secretContentsSection = new SecretContentsSection(document.getElementById("secret-contents-section"));
    this.fatalErrorSection = new FatalErrorSection(document.getElementById("fatal-error-section"));
    this.passwordGeneratorSection = new PasswordGeneratorSection(document.getElementById("password-generator-section"), new LocalStorageStateStore("password-generator-section"));
    this.notificationsSection = new NotificationsSection(document.getElementById("notifications-section"));
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.createSecretSection.onShowPasswordGenerator = () => {
      this.createSecretSection.disable();
      this.passwordGeneratorSection.show();
    };
    this.createSecretSection.onSubmitSecret = (secret: string, days: number) => {
      if (this.onSubmitSecret) {
        this.onSubmitSecret(secret, days);
      }
    };
    this.secretLinkSection.onCopyLink = (link: string) => {
      if (this.onCopyLink) {
        this.onCopyLink(link);
      }
    };
    this.secretContentsSection.onCopySecret = (secret: string) => {
      if (this.onCopySecret) {
        this.onCopySecret(secret);
      }
    };
    this.passwordGeneratorSection.onHidePasswordGenerator = () => {
      this.createSecretSection.enable();
      this.passwordGeneratorSection.hide();
    };
    this.passwordGeneratorSection.onGeneratePassword = (constraints: PasswordConstraints) => {
      if (this.onGeneratePassword) {
        this.onGeneratePassword(constraints);
      }
    };
    this.passwordGeneratorSection.onCopyPassword = (password: string) => {
      if (this.onCopyPassword) {
        this.onCopyPassword(password);
      }
    };
  }

  setPassword(password: string) {
    this.passwordGeneratorSection.setPassword(password);
  }

  showBrowserEncryptionUnavailableWarning() {
    this.createSecretSection.showBrowserEncryptionUnavailableWarning();
  }

  disablePasswordGenerationFeature() {
    this.createSecretSection.hidePasswordGeneratorButton();
    this.passwordGeneratorSection.disable();
  }

  enableCreateSecretControls() {
    this.createSecretSection.enable();
  }

  disableCreateSecretControls() {
    this.createSecretSection.disable();
  }

  enablePasswordGeneratorControls() {
    this.passwordGeneratorSection.enable();
  }

  disablePasswordGeneratorControls() {
    this.passwordGeneratorSection.disable();
  }

  displayCreateSecretSection() {
    this.hideAllSections();
    this.createSecretSection.show();
  }

  displaySecretLinkSection(link: string) {
    this.hideAllSections();
    this.secretLinkSection.show(link);
  }

  displaySecretContentsSection(secret: string) {
    this.hideAllSections();
    this.secretContentsSection.show(secret);
  }

  displayFatalError(message?: string) {
    this.hideAllSections();
    this.fatalErrorSection.show(message);
  }

  displayInfoNotification(text: string) {
    this.notificationsSection.displayInfoNotification(text);
  }

  displayErrorNotification(text: string) {
    this.notificationsSection.displayErrorNotification(text);
  }

  private hideAllSections() {
    this.createSecretSection.hide();
    this.secretLinkSection.hide();
    this.secretContentsSection.hide();
    this.fatalErrorSection.hide();
    this.passwordGeneratorSection.hide();
  }
}


