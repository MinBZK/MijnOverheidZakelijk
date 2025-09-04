"use server";

import zakenClient from "../..";
import { components } from "../../generated";

export const postZwangerschapsverlof = async ({
  body,
}: {
  body: components["schemas"]["ZwangerschapsverlofRequest"];
}) => {
  const response = await zakenClient.POST("/uwv/meldingen", {
    body: body,
  });

  return response.data;
};
