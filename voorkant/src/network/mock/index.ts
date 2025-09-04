import createClient from "openapi-fetch";
import type { paths } from "./generated";

const zakenClient = createClient<paths>({
  baseUrl: process.env.API_URL_ZAAK_SERVICE,
});

export default zakenClient;
