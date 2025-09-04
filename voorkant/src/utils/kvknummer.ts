"use server";
import { cookies } from "next/headers";

export async function getKvkFromCookie() {
  return (await cookies()).get("kvk")?.value;
}

export async function updateKvkCookie(newKvk: string) {
  console.log("updating");
  (await cookies()).set({
    name: "kvk",
    value: newKvk,
    httpOnly: true,
    secure: true,
    path: "/",
  });
}
