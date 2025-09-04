import { useCallback } from "react";
import { z, ZodSchema } from "zod";

// All the cookies that can be set, should have a schema associated with them for soem validation
const schemas = {
  loginMethod: z.enum(["digid", "eherkenning"]),
} as const satisfies Record<string, ZodSchema>;

// Helper to get a cookie value by name
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// Helper to set a cookie
function setCookie(
  name: string,
  value: string,
  options?: { path?: string; expires?: Date },
) {
  if (typeof document === "undefined") return;
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (options?.path) cookie += `; path=${options.path}`;
  if (options?.expires) cookie += `; expires=${options.expires.toUTCString()}`;
  document.cookie = cookie;
}

// Infer the type from the schema for a given key
export function useCookie<K extends keyof typeof schemas>(name: K) {
  type Value = z.infer<(typeof schemas)[K]>;
  // Get and validate cookie
  const get = useCallback((): Value | null => {
    const value = getCookie(name);
    if (!value) return null;
    const parsed = schemas[name].safeParse(
      typeof value === "string" ? value : JSON.parse(value),
    );
    return parsed.success ? parsed.data : null;
  }, [name]);

  // Set cookie with validation
  const set = useCallback(
    (value: Value, options?: { path?: string; expires?: Date }) => {
      const parsed = schemas[name].safeParse(value);
      if (!parsed.success) throw new Error("Invalid cookie value");
      if (typeof value === "string") {
        setCookie(name, value, options);
      } else {
        setCookie(name, JSON.stringify(value), options);
      }
    },
    [name],
  );

  return { get, set };
}
