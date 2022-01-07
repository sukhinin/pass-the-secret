export interface PasswordGenerator {
  generate(constraints: PasswordConstraints): Promise<string>;
}

export interface PasswordConstraints {
  length: number;
  lowercaseLetters: boolean;
  uppercaseLetters: boolean;
  digits: boolean;
  specialCharacters: boolean;
}
