"use client";
import Button from "@/components/button";
import Card from "@/components/card";
import FormField from "@/components/form/formField";
import { useCreateParkeervergunning } from "@/network/mock/hooks/createParkeervergunning/useCreateParkeervergunning";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

const ParkeervergunningForm = ({ kvk }: { kvk: string }) => {
  const parkeervergunningSchema = z.object({
    bedrijfsKvk: z.string().min(1),
    kenteken: z.string().min(1),
    motivatie: z.string(),
    aanvragerEmail: z.string().email(),
  });

  // TODO: Replace with actual mutation hook for parkeervergunning
  const { mutate } = useCreateParkeervergunning();

  const router = useRouter();
  const form = useForm({
    defaultValues: {
      bedrijfsKvk: kvk,
      kenteken: "",
      motivatie: "",
      aanvragerEmail: "",
    },
    validators: {
      onSubmit: parkeervergunningSchema,
    },
    onSubmit: ({ value: values }) => {
      console.log(values);
      mutate({ body: values }, { onSuccess: () => router.push("/zaken") });
    },
  });

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-h2">Nieuwe parkeervergunning aanvragen</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="border-b-1 border-gray-200 pb-2">
          <div className="grid grid-cols-2 gap-4 *:py-4">
            <div>
              <form.Field name="kenteken">
                {(field) => <FormField label={"Kenteken"} field={field} />}
              </form.Field>
            </div>
            <div>
              <form.Field name="motivatie">
                {(field) => <FormField label={"Motivatie"} field={field} />}
              </form.Field>
            </div>
            <div>
              <form.Field name="aanvragerEmail">
                {(field) => <FormField label={"E-mail"} field={field} />}
              </form.Field>
            </div>
          </div>
        </div>
        <div className="pt-4">
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            <Button type="submit">Opslaan</Button>
          </form.Subscribe>
        </div>
      </form>
    </Card>
  );
};

export default ParkeervergunningForm;
