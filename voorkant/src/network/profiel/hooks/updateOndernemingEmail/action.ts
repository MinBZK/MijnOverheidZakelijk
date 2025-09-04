"use server";

import profielClient from "@/network/profiel";

type TParams = {
  kvkNummer: string;
  email: string;
};

export const putEmailAction = async (params: TParams) => {
  const response = await profielClient.PUT("/ondernemingen/{kvkNummer}", {
    params: {
      path: { kvkNummer: params.kvkNummer },
      query: { email: params.email },
    },
  });

  return response.data;
};
