"use server";

import zakenClient from "../..";
import { components } from "../../generated";

export const postSubsidie = async ({
  body,
}: {
  body: components["schemas"]["SubsidieAanvraagRequest"];
}) => {
  const response = await zakenClient.POST("/vng/aanvragen/subsidie", {
    body: body,
  });

  return response.data;
};
