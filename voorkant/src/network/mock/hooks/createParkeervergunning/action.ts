"use server";

import zakenClient from "../..";
import { components } from "../../generated";

export const postParkeervergunning = async ({
  body,
}: {
  body: components["schemas"]["ParkeervergunningAanvraagRequest"];
}) => {
  const response = await zakenClient.POST("/vng/aanvragen/parkeervergunning", {
    body: body,
  });

  return response.data;
};
