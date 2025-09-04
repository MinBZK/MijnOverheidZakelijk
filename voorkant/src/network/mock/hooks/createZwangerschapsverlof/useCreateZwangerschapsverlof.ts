import { useMutation } from "@tanstack/react-query";
import { postZwangerschapsverlof } from "./action";

export const useCreateZwangerschapsverlof = () =>
  useMutation({
    mutationFn: postZwangerschapsverlof,
  });
