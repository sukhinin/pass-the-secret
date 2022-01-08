import { UserInterface } from "./ui";
import { EncryptingStore, PlainStore, Store } from "./store";
import { BrowserCrypto } from "./crypto";
import { ApplicationError } from "./ApplicationError";
import { CryptoPasswordGenerator, NotSupportedPasswordGenerator, PasswordGenerator } from "./passwords";
import { PasswordConstraints } from "./passwords/PasswordGenerator";

const ui = new UserInterface(document);
const store = createStore();
const passwordGenerator = createPasswordGenerator();

ui.onGeneratePassword = (constraints) => onGeneratePassword(constraints);
ui.onCopyPassword = (password) => onCopyValue(password, "Password copied to clipboard.", "Unable to copy password to clipboard.");
ui.onCreateSecret = (secret, days) => onCreateSecret(secret, days);
ui.onCopyLink = (link) => onCopyValue(link, "Link copied to clipboard.", "Unable to copy link to clipboard.");
ui.onCopySecret = (secret) => onCopyValue(secret, "Secret copied to clipboard.", "Unable to copy secret to clipboard.");

if (window.location.hash) {
  retrieveSecret(window.location.hash.replace("#", ""))
    .then(secret => ui.displaySecretContentsSection(secret))
    .catch(e => handleFatalError(e, "Unable to retrieve secret."));
} else {
  ui.displayCreateSecretSection();
}

async function onGeneratePassword(constraints: PasswordConstraints) {
  try {
    ui.disablePasswordGeneratorControls();
    const password = await passwordGenerator.generate(constraints);
    ui.setPassword(password);
  } catch (e) {
    printErrorToConsole(e);
    const message = e instanceof ApplicationError ? e.message : "Unable to generate password.";
    ui.displayErrorNotification(message);
  } finally {
    ui.enablePasswordGeneratorControls();
  }
}

async function onCopyValue(value: string, successMessage: string, errorMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    ui.displayInfoNotification(successMessage);
  } catch (e) {
    printErrorToConsole(e);
    const message = e instanceof ApplicationError ? e.message : errorMessage;
    ui.displayErrorNotification(message);
  }
}

async function onCreateSecret(secret: string, days: number) {
  try {
    ui.disableCreateSecretControls();
    const ref = await store.put(secret, days);
    const link = `${window.location.origin}/#${ref.id};${ref.key}`;
    ui.displaySecretLinkSection(link);
  } catch (e) {
    printErrorToConsole(e);
    const message = e instanceof ApplicationError ? e.message : "Unable to create secret.";
    ui.displayErrorNotification(message);
  } finally {
    ui.enableCreateSecretControls();
  }
}

async function retrieveSecret(hash: string): Promise<string> {
  const [id, key] = hash.split(";");
  if (!id || !key) {
    throw new ApplicationError("The link has invalid format.");
  }

  const secret = await store.get({ id, key });
  if (secret === null) {
    throw new ApplicationError("Secret not found. Probably the link has already been consumed.");
  }

  return secret;
}

function handleFatalError(e: Error, defaultMessage: string) {
  printErrorToConsole(e);
  const message = e instanceof ApplicationError ? e.message : defaultMessage;
  ui.displayFatalError(message);
}

function printErrorToConsole(e: Error) {
  console.error(e);
  if (e instanceof ApplicationError && e.cause) {
    printErrorToConsole(e.cause);
  }
}

function createStore(): Store {
  if (BrowserCrypto.isSupported()) {
    const crypto = new BrowserCrypto();
    return new EncryptingStore(crypto);
  } else {
    ui.showBrowserEncryptionUnavailableWarning();
    return new PlainStore();
  }
}

function createPasswordGenerator(): PasswordGenerator {
  if (BrowserCrypto.isSupported()) {
    const crypto = new BrowserCrypto();
    return new CryptoPasswordGenerator(crypto);
  } else {
    ui.disablePasswordGenerationFeature();
    return new NotSupportedPasswordGenerator();
  }
}
