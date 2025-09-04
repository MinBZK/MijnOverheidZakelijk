import { useMutation } from "@tanstack/react-query";
import { putEmailAction } from "./action";

export const useUpdateOndernemenEmail = () =>
  useMutation({
    mutationFn: putEmailAction,
  });
