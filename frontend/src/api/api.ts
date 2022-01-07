import { ApiError } from "./ApiError";

export async function post(url: string, data: any): Promise<any> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json;charset=UTF-8"
    },
    body: JSON.stringify(data)
  });

  const json = await response.json().catch(() => {});

  if (!response.ok) {
    const error = json.error ?? "unknown error";
    const message = `POST to ${url} failed (${response.statusText} ${response.status}): ${error}`
    throw new ApiError(message, response.status, response.statusText, error);
  }

  return json;
}
