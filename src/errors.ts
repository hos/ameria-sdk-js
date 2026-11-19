import type { AmeriaEndpoint } from "./types.js";

/** Thrown when the bank answers with a non-2xx status or a non-JSON body. */
export class AmeriaHttpError extends Error {
  readonly status: number;
  readonly endpoint: AmeriaEndpoint;
  /** First 500 characters of the response body, for debugging. */
  readonly body: string;

  constructor(endpoint: AmeriaEndpoint, status: number, body: string) {
    super(`Ameria ${endpoint} failed with HTTP ${status}`);
    this.name = "AmeriaHttpError";
    this.endpoint = endpoint;
    this.status = status;
    this.body = body.slice(0, 500);
  }
}
