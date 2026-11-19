import type { AmeriaFns } from "./types.js";

const HOST = "https://services.ameriabank.am/VPOS";
const TEST_HOST = "https://servicestest.ameriabank.am/VPOS";
const DEFAULT_TIMEOUT_MS = 30_000;

/** Options for {@link Client}. */
export interface AmeriaClientParams {
  /** Client ID issued by Ameriabank. */
  clientId: string;
  username: string;
  password: string;
  /** Use the bank's test environment (servicestest.ameriabank.am). */
  isTest?: boolean;
  /** Abort a request to the bank after this many milliseconds. Default 30000. */
  timeoutMs?: number;
}

/** Thrown when the bank answers with a non-2xx status or a non-JSON body. */
export class AmeriaHttpError extends Error {
  readonly status: number;
  readonly endpoint: AmeriaFns;
  /** First 500 characters of the response body, for debugging. */
  readonly body: string;

  constructor(endpoint: AmeriaFns, status: number, body: string) {
    super(`Ameria ${endpoint} failed with HTTP ${status}`);
    this.name = "AmeriaHttpError";
    this.endpoint = endpoint;
    this.status = status;
    this.body = body.slice(0, 500);
  }
}

/** @internal Base class that sends requests; use {@link Client}. */
export class AmeriaClient {
  // Credentials live in true private fields so they never show up in
  // console.log(client), JSON.stringify(client) or error reporters.
  readonly #clientId: string;
  readonly #username: string;
  readonly #password: string;
  readonly #timeoutMs: number;
  /** Base URL of the bank API this client talks to. */
  readonly host: string;

  constructor(params: AmeriaClientParams) {
    for (const key of ["clientId", "username", "password"] as const) {
      if (typeof params[key] !== "string" || params[key] === "") {
        throw new TypeError(`AmeriaClient: "${key}" is required`);
      }
    }
    this.#clientId = params.clientId;
    this.#username = params.username;
    this.#password = params.password;
    this.#timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.host = params.isTest ? TEST_HOST : HOST;
  }

  /** The client ID this client was created with. */
  get clientId(): string {
    return this.#clientId;
  }

  protected ameriaFetch = async <T>(
    path: AmeriaFns,
    body: object,
  ): Promise<T> => {
    const response = await fetch(`${this.host}/api/VPOS/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...body,
        ClientID: this.#clientId,
        Username: this.#username,
        Password: this.#password,
      }),
      redirect: "error",
      signal: AbortSignal.timeout(this.#timeoutMs),
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.startsWith("application/json")) {
      throw new AmeriaHttpError(path, response.status, await response.text());
    }
    return (await response.json()) as T;
  };
}
