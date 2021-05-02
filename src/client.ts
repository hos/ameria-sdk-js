import fetch from "node-fetch";
import { AmeriaFns } from "./types";

const HOST = "https://services.ameriabank.am/VPOS";
const TEST_HOST = "https://servicestest.ameriabank.am/VPOS";

export interface AmeriaClientParams {
  clientId: string;
  username: string;
  password: string;
  isTest?: boolean;
}

export class AmeriaClient {
  clientId: string;
  username: string;
  password: string;
  host: string;

  constructor(params: AmeriaClientParams) {
    this.clientId = params.clientId;
    this.username = params.username;
    this.password = params.password;
    this.host = params.isTest ? TEST_HOST : HOST;
  }

  ameriaFetch = async (path: AmeriaFns, body: any): Promise<any> => {
    const response = await fetch(`${this.host}/api/VPOS/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        ClientID: this.clientId,
        Username: this.username,
        Password: this.password,
      }),
    });

    const contentType = response.headers.get("content-type");
    if (contentType?.startsWith("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  };
}
