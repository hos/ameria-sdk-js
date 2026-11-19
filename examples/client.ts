import { AmeriaClient } from "@ameria/vpos-sdk";

export const ameria = new AmeriaClient({
  clientId: process.env.AMERIA_CLIENT_ID!,
  username: process.env.AMERIA_USERNAME!,
  password: process.env.AMERIA_PASSWORD!,
  isTest: process.env.NODE_ENV !== "production",
});
