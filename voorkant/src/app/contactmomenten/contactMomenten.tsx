"use client";

import Card from "@/components/card";
import ContactMoment from "@/components/ContactMoment";
import CountdownBar from "@/components/CountdownBar";
import { getContactMomenten } from "@/network/omc/fetchers/getContactMomenten";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";

const ContactmomentenPage = ({ kvk }: { kvk: string }) => {
  const queryClient = useQueryClient();
  const { isLoading, isError, data } = useQuery({
    queryKey: ["contactMomenten", kvk],
    queryFn: () => getContactMomenten(kvk),
    enabled: kvk != null,
  });
  const countdownRef = useRef<{ reset: () => void }>(null);

  if (isLoading) {
    <p>loading</p>;
  }
  if (isError) {
    <p>error</p>;
  }

  const handleCountdownEnd = () => {
    queryClient.invalidateQueries({ queryKey: ["contactMomenten"] });
    if (countdownRef.current) {
      countdownRef.current.reset();
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 w-full space-y-5 md:col-span-8">
        <h1 className="text-3xl">Contactmomenten</h1>
        <Card>
          <CountdownBar onComplete={handleCountdownEnd} ref={countdownRef} />
          <div className="relative space-y-8 py-5 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {data?.Notificaties?.map((notificatie) => {
              return (
                <ContactMoment notificatie={notificatie} key={notificatie.id} />
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContactmomentenPage;
