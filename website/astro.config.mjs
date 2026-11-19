// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import starlightLlmsTxt from "starlight-llms-txt";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

export default defineConfig({
  site: "https://hos.github.io",
  base: "/ameria-sdk-js",
  trailingSlash: "always",
  integrations: [
    starlight({
      title: "Ameria vPOS SDK",
      description:
        "Unofficial TypeScript SDK for accepting card payments with Ameriabank vPOS.",
      logo: { src: "./src/assets/logo.svg" },
      favicon: "/favicon.svg",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/hos/ameria-sdk-js",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/hos/ameria-sdk-js/edit/main/website/",
      },
      lastUpdated: true,
      customCss: ["./src/styles/theme.css"],
      expressiveCode: { defaultProps: { wrap: true } },
      plugins: [
        starlightLlmsTxt({
          projectName: "Ameria vPOS SDK",
          description:
            "Unofficial TypeScript SDK for the Ameriabank vPOS payment API (Armenia). ESM-only, Node.js 22.12+, no runtime dependencies.",
          details:
            "Always confirm a payment with `verifyPayment` before fulfilling an order: the redirect to `backUrl` is not signed. The test environment only accepts 10 AMD and order IDs from the merchant's assigned range.",
        }),
        starlightLinksValidator({ errorOnLocalLinks: true }),
        starlightTypeDoc({
          entryPoints: ["../src/index.ts"],
          tsconfig: "../tsconfig.build.json",
          sidebar: { label: "API reference", collapsed: true },
          typeDoc: {
            excludeInternal: true,
            excludePrivate: true,
            excludeProtected: true,
            treatWarningsAsErrors: true,
            validation: { notExported: true, invalidLink: true },
            sort: ["kind", "source-order"],
          },
        }),
      ],
      sidebar: [
        {
          label: "Start here",
          items: [
            { slug: "getting-started" },
            { slug: "testing" },
            { slug: "migration" },
          ],
        },
        {
          label: "Guides",
          items: [
            { slug: "guides/accept-a-payment" },
            { slug: "guides/two-step-payments" },
            { slug: "guides/refunds" },
            { slug: "guides/saved-cards" },
            { slug: "guides/errors" },
          ],
        },
        {
          label: "Reference",
          items: [{ slug: "security" }, { slug: "response-codes" }],
        },
        typeDocSidebarGroup,
      ],
    }),
  ],
});
