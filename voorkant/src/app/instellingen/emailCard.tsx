"use client";
import Button from "@/components/button";
import Card from "@/components/card";
import FormField from "@/components/form/formField";
import { Icon } from "@/components/icons/infoIcon";
import { Notification } from "@/components/notifications";
import { useUpdateOndernemenEmail } from "@/network/profiel/hooks/updateOndernemingEmail/useUpdateOndernemenEmail";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";

export const EmailCard = ({
  currentEmail,
  kvkNummer,
}: {
  currentEmail: string;
  kvkNummer: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSuccesful, setIsSuccessful] = useState(false);
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const { mutate } = useUpdateOndernemenEmail();

  const emailSchema = z.object({
    email: z
      .string()
      .min(1, { message: "Vul een email in" })
      .email("Dit is geen valide email"),

    verifyCode: z.string().min(1),
  });

  const form = useForm({
    defaultValues: {
      email: currentEmail,
      verifyCode: "",
    },
    validators: {
      onSubmit: emailSchema,
    },
    onSubmit: ({ value: values }) => {
      if (!showVerification) return;
      mutate(
        { kvkNummer: kvkNummer, email: values.email },
        {
          onSuccess: () => {
            setIsSuccessful(true);
            setShowVerification(false);
            form.resetField("verifyCode");
          },
        },
      );
    },
  });

  return (
    <>
      {isSuccesful && (
        <Notification
          variant="success"
          header="Succesvol email geupdate"
          text="Het E-mailadres is succesvol geupdate en wij zullen vanaf nu hier uw berichten naar sturen"
        />
      )}
      <Card className="flex flex-col gap-4">
        <h2 className="text-h2">E-mailadres</h2>
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
                <form.Field name="email">
                  {(field) => (
                    <FormField
                      label={"E-mailadres"}
                      field={field}
                      readOnly={!isEditing}
                    />
                  )}
                </form.Field>
              </div>

              <div className="grid grid-cols-1">
                <div className="text-right">
                  <Icon
                    variant="information"
                    handleClick={() => setShowExtraInfo(!showExtraInfo)}
                  />
                </div>
                <div className="text-right">
                  {isEditing ? (
                    <p
                      className="text-primary clear-right underline"
                      onClick={() => {
                        form.reset();
                        setIsEditing(false);
                      }}
                    >
                      Annuleren
                    </p>
                  ) : (
                    <p
                      className="text-primary clear-right underline"
                      onClick={() => {
                        setIsSuccessful(false);
                        setShowVerification(false);
                        setIsEditing(true);
                      }}
                    >
                      E-mailadres invullen of aanpassen
                    </p>
                  )}
                </div>
              </div>
            </div>
            {showExtraInfo && (
              <div className="bg-blue-200 px-4 py-2">
                <Icon
                  variant="information"
                  handleClick={() => setShowExtraInfo(!showExtraInfo)}
                />
                <span className="ml-1">
                  Het e-mailadres waarop uw bedrijf meldingen van de aangesloten
                  overheid organisaties wilt ontvangen
                </span>
              </div>
            )}

            {showVerification && (
              <>
                <p className="font-bold">Persoonlijke code</p>
                <div className="flex items-center gap-5">
                  <div className="">
                    <form.Field name="verifyCode">
                      {(field) => <FormField field={field} />}
                    </form.Field>
                  </div>
                  <div className="">
                    <form.Subscribe
                      selector={(state) => [
                        state.canSubmit,
                        state.isSubmitting,
                      ]}
                    >
                      {([canSubmit]) => (
                        <Button type="submit" disabled={!canSubmit}>
                          Verifiëren
                        </Button>
                      )}
                    </form.Subscribe>
                  </div>
                </div>
                <p className="text-blue-900 underline">
                  Nieuwe persoonlijke code sturen
                </p>
              </>
            )}
          </div>

          <div className="pt-4">
            <Button
              onClick={() => {
                if (!isEditing) return;

                setIsEditing(false);
                setShowVerification(true);
              }}
            >
              Opslaan
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
};
