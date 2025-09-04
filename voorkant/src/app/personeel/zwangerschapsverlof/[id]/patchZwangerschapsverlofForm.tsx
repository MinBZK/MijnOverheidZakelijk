"use client";
import Button from "@/components/button";
import Card from "@/components/card";
import FormField from "@/components/form/formField";
import { useUpdateZwangerschapsverlof } from "@/network/mock/hooks/updateZwangerschapsverlof/useUpdateZwangerschapsverlof";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

const PatchZwangerschapsverlofForm = ({ zaakId }: { zaakId: string }) => {
  const zwangerschapsverlofSchema = z.object({
    opmerking: z.string().min(1),
  });

  const { mutate } = useUpdateZwangerschapsverlof();

  const router = useRouter();
  const form = useForm({
    defaultValues: {
      opmerking: "",
    },
    validators: {
      onSubmit: zwangerschapsverlofSchema,
    },
    onSubmit: ({ value: values }) => {
      console.log(values);

      mutate(
        { body: values, id: zaakId },
        {
          onSuccess: () => {
            router.push("/personeel");
          },
        },
      );
    },
  });

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-h2">
        Opmerking aan zwangerschapsverlofaanvraag toevoegen
      </h2>
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
              <form.Field name="opmerking">
                {(field) => <FormField label={"Opmerking"} field={field} />}
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

export default PatchZwangerschapsverlofForm;
