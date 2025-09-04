"use client";

import { ErrorBoundary, ErrorBoundaryProps } from "@/components/ErrorBoundary";

export default function Error(props: ErrorBoundaryProps) {
  return (
    <>
      <h1 className="text-h1">Er is iets misgegaan...</h1>
      <ErrorBoundary {...props} />
    </>
  );
}
