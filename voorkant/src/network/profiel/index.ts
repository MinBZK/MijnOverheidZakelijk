import createClient from "openapi-fetch";
import type { paths } from "./generated";

const profielClient = createClient<paths>({
  baseUrl: process.env.API_URL_PROFIEL_SERVICE,
});

export default profielClient;
