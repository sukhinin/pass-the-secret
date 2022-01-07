export class ApiError extends Error {

  public readonly status: number;
  public readonly statusText: string;
  public readonly error: string;

  constructor(message: string, status: number, statusText: string, error: string) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.error = error;
  }
}
