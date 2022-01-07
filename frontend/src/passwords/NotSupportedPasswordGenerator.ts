import { PasswordConstraints, PasswordGenerator } from "./PasswordGenerator";
import { ApplicationError } from "../ApplicationError";

export class NotSupportedPasswordGenerator implements PasswordGenerator {
  async generate(constraints: PasswordConstraints): Promise<string> {
    throw new ApplicationError("Password generation feature is not supported.")
  }
}
