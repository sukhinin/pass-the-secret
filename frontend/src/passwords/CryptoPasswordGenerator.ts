import { Crypto } from "../crypto";
import { PasswordConstraints, PasswordGenerator } from "./PasswordGenerator";
import { checkPasswordConstraints, getPasswordCharacters } from "./utils";
import { ApplicationError } from "../ApplicationError";

const MIN_PASSWORD_LENGTH = 0;
const MAX_PASSWORD_LENGTH = 100;
const MAX_PASSWORD_CANDIDATES = 10000;

export class CryptoPasswordGenerator implements PasswordGenerator {

  private readonly crypto: Crypto;
  private entropy: Array<number> = [];

  constructor(crypto: Crypto) {
    this.crypto = crypto;
  }

  async generate(constraints: PasswordConstraints): Promise<string> {
    if (constraints.length <= MIN_PASSWORD_LENGTH || constraints.length >= MAX_PASSWORD_LENGTH) {
      throw new ApplicationError(`Password length must be in range ${MIN_PASSWORD_LENGTH}..${MAX_PASSWORD_LENGTH}.`);
    }

    const chars = getPasswordCharacters(constraints);
    if (chars.length == 0) {
      return "";
    }

    for (let i = 0; i < MAX_PASSWORD_CANDIDATES; i++) {
      const password = await this.getPasswordCandidate(constraints.length, chars);
      if (checkPasswordConstraints(password, constraints)) {
        return password;
      }
    }

    throw new ApplicationError(`Failed to generate suitable password in ${MAX_PASSWORD_CANDIDATES} attempts.`);
  }

  private async getPasswordCandidate(length: number, chars: string): Promise<string> {
    let password = "";
    while (password.length < length) {
      password += await this.getNextPasswordCharacter(chars);
    }
    return password;
  }

  private async getNextPasswordCharacter(chars: string): Promise<string> {
    const random = await this.getNextRandomByte();
    const threshold = 256 - (256 % chars.length);
    return (random < threshold) ? chars[random % chars.length] : "";
  }

  private async getNextRandomByte(): Promise<number> {
    if (this.entropy.length == 0) {
      const bytes = await this.crypto.generateRandom(1024);
      this.entropy = Array.from(new Uint8Array(bytes));
    }
    return this.entropy.pop();
  }
}
