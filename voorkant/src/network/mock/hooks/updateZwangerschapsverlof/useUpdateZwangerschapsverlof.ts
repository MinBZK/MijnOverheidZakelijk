import { useMutation } from "@tanstack/react-query";
import { patchZwangerschapsverlof } from "./action";

export const useUpdateZwangerschapsverlof = () =>
  useMutation({
    mutationFn: patchZwangerschapsverlof,
  });
