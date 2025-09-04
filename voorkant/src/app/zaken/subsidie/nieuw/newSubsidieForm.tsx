"use client";
import Card from "@/components/card";
import Button from "@/components/button";
import FormField, { FieldInfo } from "@/components/form/formField";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useCreateSubsidie } from "@/network/mock/hooks/createSubsidie/useCreateSubsidie";

const NewSubsidieForm = ({ kvk }: { kvk: string }) => {
  const subsidieSchema = z.object({
    bedrijfsKvk: z.string().min(1),
    subtype: z.string().min(1),
    motivatie: z.string(),
    aanvragerEmail: z.string().email(),
  });

  // TODO: Replace with actual mutation hook for subsidie aanvraag
  const { mutate } = useCreateSubsidie();
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      bedrijfsKvk: kvk,
      subtype: "",
      motivatie: "",
      aanvragerEmail: "",
    },
    validators: {
      onSubmit: subsidieSchema,
    },
    onSubmit: ({ value: values }) => {
      console.log(values);
      mutate({ body: values }, { onSuccess: () => router.push("/zaken") });
    },
  });

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-h2">Nieuwe subsidie aanvragen</h2>
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
              <form.Field name="subtype">
                {(field) => (
                  <>
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Subsidie type
                    </label>
                    <select
                      value={field.state.value as string}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className={`focus:border-primary w-full rounded border-1 border-solid border-gray-200 px-1.5 py-1 focus:outline-none`}
                    >
                      <option value=""></option>
                      <option value="Warmtepomp">Warmtepomp</option>
                      <option value="Zonnepanelen">Zonnepanelen</option>
                      <option value="HR++ Glas">HR++ Glas</option>
                    </select>
                    <FieldInfo field={field} />
                  </>
                )}
              </form.Field>
            </div>
            <div>
              <form.Field name="aanvragerEmail">
                {(field) => <FormField label={"E-mail"} field={field} />}
              </form.Field>
            </div>
            <div>
              <form.Field name="motivatie">
                {(field) => (
                  // <FormField label={"Motivatie"} field={field} />
                  <>
                    <label
                      className="mb-2 block text-sm font-bold text-gray-700"
                      htmlFor={field.name}
                    >
                      Motivatie
                    </label>
                    <textarea
                      id="body"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={(e) => field.handleChange(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </>
                )}
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

export default NewSubsidieForm;
