import createClient from "openapi-fetch";
import type { paths } from "./generated";

const omcClient = createClient<paths>({
  baseUrl: process.env.API_URL_OMC_SERVICE,
});

export default omcClient;
