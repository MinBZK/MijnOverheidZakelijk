"use server";

import { signOut } from "@/auth";

export async function SignOutAction() {
  await signOut();
}
