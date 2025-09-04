import { useMutation } from "@tanstack/react-query";
import { postParkeervergunning } from "./action";

export const useCreateParkeervergunning = () =>
  useMutation({
    mutationFn: postParkeervergunning,
  });
