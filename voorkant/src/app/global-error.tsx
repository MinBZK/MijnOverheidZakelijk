"use client";

import Card from "@/components/card";
import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function GlobalError(props: ErrorBoundaryProps) {
  return (
    <html lang="nl">
      <head>
        <title>MijnOverheid Zakelijk - global error</title>
      </head>
      <body>
        <main className="container p-6">
          <Card>
            <h1 className="text-h1">Er is iets misgegaan...</h1>
            <ErrorBoundary {...props} />
          </Card>
        </main>
      </body>
    </html>
  );
}
