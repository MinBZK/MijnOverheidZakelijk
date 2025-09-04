"use client";
import Button from "@/components/button";
import Card from "@/components/card";
import FormField from "@/components/form/formField";
import { useCreateZwangerschapsverlof } from "@/network/mock/hooks/createZwangerschapsverlof/useCreateZwangerschapsverlof";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { z } from "zod";

const NewZwangerschapsverlofForm = ({ kvk }: { kvk: string }) => {
  const zwangerschapsverlofSchema = z.object({
    bsn: z.string().min(1),
    naam: z.string().min(1),
    startDatum: z.string().min(1),
    eindDatum: z.string().min(1),
    bedrijfsKvk: z.string().min(1),
    opmerking: z.string().min(1),
  });

  const { mutate } = useCreateZwangerschapsverlof();

  const router = useRouter();
  const form = useForm({
    defaultValues: {
      bedrijfsKvk: kvk,
      bsn: "",
      naam: "",
      startDatum: "",
      eindDatum: "",
      opmerking: "",
    },
    validators: {
      onSubmit: zwangerschapsverlofSchema,
    },
    onSubmit: ({ value: values }) => {
      console.log(values);

      mutate(
        { body: values },
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
      <h2 className="text-h2">Nieuw zwangerschapsverlof melden</h2>
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
              <form.Field name="bsn">
                {(field) => <FormField label={"BSN"} field={field} />}
              </form.Field>
            </div>
            <div>
              <form.Field name="naam">
                {(field) => <FormField label={"Naam"} field={field} />}
              </form.Field>
            </div>
            <div>
              <form.Field name="startDatum">
                {(field) => {
                  const handleChange = (
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    const date = e.target.value;
                    const utcString = new Date(
                      `${date}T00:00:00Z`,
                    ).toISOString();
                    field.handleChange(utcString);
                  };

                  const value = field.state.value
                    ? new Date(field.state.value).toISOString().split("T")[0]
                    : "";

                  return (
                    <>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Begindatum
                      </label>
                      <input
                        className="border"
                        type="date"
                        value={value}
                        onChange={handleChange}
                      />
                    </>
                  );
                }}
              </form.Field>
            </div>
            <div>
              <form.Field name="eindDatum">
                {(field) => {
                  const handleChange = (
                    e: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    const date = e.target.value;
                    const utcString = new Date(
                      `${date}T00:00:00Z`,
                    ).toISOString();
                    field.handleChange(utcString);
                  };

                  const value = field.state.value
                    ? new Date(field.state.value).toISOString().split("T")[0]
                    : "";

                  return (
                    <>
                      <label className="mb-2 block text-sm font-bold text-gray-700">
                        Einddatum
                      </label>
                      <input
                        className="border"
                        type="date"
                        value={value}
                        onChange={handleChange}
                      />
                    </>
                  );
                }}
              </form.Field>
            </div>
            <div>
              <form.Field name="opmerking">
                {(field) => <FormField label={"Opmerking"} field={field} />}
              </form.Field>
            </div>
          </div>
        </div>{" "}
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

export default NewZwangerschapsverlofForm;
