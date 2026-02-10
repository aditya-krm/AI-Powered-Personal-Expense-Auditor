"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isValidAuthToken } from "../lib/auth";

export async function deleteTransaction(id: number) {
  // Authorization check - consistent with middleware protection
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  
  if (!isValidAuthToken(authToken)) {
    throw new Error("Unauthorized: Invalid or missing authentication");
  }
  
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
}
