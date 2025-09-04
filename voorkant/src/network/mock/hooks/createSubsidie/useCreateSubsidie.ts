import { useMutation } from "@tanstack/react-query";
import { postSubsidie } from "./action";

export const useCreateSubsidie = () =>
  useMutation({
    mutationFn: postSubsidie,
  });
