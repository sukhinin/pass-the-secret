import { PasswordConstraints } from "./PasswordGenerator";

export const LOWERCASE_LETTERS = "abcdefghijklmnopqrstuvwxyz";
export const UPPERCASE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const DIGITS = "01234567890";
export const SPECIAL_CHARACTERS = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";

export function getPasswordCharacters(constraints: PasswordConstraints): string {
  let characters = "";
  if (constraints.lowercaseLetters) {
    characters += LOWERCASE_LETTERS;
  }
  if (constraints.uppercaseLetters) {
    characters += UPPERCASE_LETTERS;
  }
  if (constraints.digits) {
    characters += DIGITS;
  }
  if (constraints.specialCharacters) {
    characters += SPECIAL_CHARACTERS;
  }
  return characters;
}

export function checkPasswordConstraints(password: string, constraints: PasswordConstraints): boolean {
  if (password.length != constraints.length) {
    return false;
  }

  let missingLowercaseLetter = constraints.lowercaseLetters;
  let missingUppercaseLetter = constraints.uppercaseLetters;
  let missingDigit = constraints.digits;
  let missingSpecialCharacter = constraints.specialCharacters;

  for (let c of password) {
    if (LOWERCASE_LETTERS.includes(c)) {
      missingLowercaseLetter = false;
    }
    if (UPPERCASE_LETTERS.includes(c)) {
      missingUppercaseLetter = false;
    }
    if (DIGITS.includes(c)) {
      missingDigit = false;
    }
    if (SPECIAL_CHARACTERS.includes(c)) {
      missingSpecialCharacter = false;
    }
  }

  return !(missingLowercaseLetter || missingUppercaseLetter || missingDigit || missingSpecialCharacter);
}
