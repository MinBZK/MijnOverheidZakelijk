"use server";

import zakenClient from "../..";
import { components } from "../../generated";

export const patchZwangerschapsverlof = async ({
  id,
  body,
}: {
  id: string;
  body: components["schemas"]["UpdateZwangerschapsverlofRequest"];
}) => {
  const response = await zakenClient.PATCH("/uwv/meldingen/{id}/opmerking", {
    params: {
      path: { id: id },
    },
    body: body,
  });

  return response.data;
};
