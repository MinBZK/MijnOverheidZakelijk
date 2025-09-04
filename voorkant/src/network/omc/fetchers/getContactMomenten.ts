"use server";

import omcClient from "..";

export const getContactMomenten = async (kvkNummer: string) => {
  const response = await omcClient.GET("/notificaties/{kvkNummer}", {
    params: {
      path: { kvkNummer: kvkNummer },
    },
  });

  if (response.data) {
    return response.data;
  } else {
    return {
      kvkNummer: kvkNummer,
      Notificaties: [],
    };
  }
};
