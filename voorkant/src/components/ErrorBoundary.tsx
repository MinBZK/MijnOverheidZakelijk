"use client";

import Button from "@/components/button";
import Card from "@/components/card";
import { Notification } from "@/components/notifications";

export type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="*:mb-4">
      <Notification variant="error" header="Error" text={error.message} />
      <Card>
        <Button type={"button"} onClick={() => reset()}>
          Probeer opnieuw
        </Button>
      </Card>
    </div>
  );
}
