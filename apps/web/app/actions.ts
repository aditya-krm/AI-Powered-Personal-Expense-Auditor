"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function deleteTransaction(id: number) {
  // Basic authorization check - ensure user is authenticated
  // In production with multi-user support, also verify the transaction belongs to the user
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  const expectedToken = process.env.WEB_ACCESS_TOKEN;
  
  if (expectedToken && authToken !== expectedToken) {
    throw new Error("Unauthorized: Invalid or missing authentication");
  }
  
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
}
