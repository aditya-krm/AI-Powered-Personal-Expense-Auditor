"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function deleteTransaction(id: number) {
  // Authorization check - consistent with middleware protection
  const expectedToken = process.env.WEB_ACCESS_TOKEN;
  
  if (expectedToken) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    
    if (authToken !== expectedToken) {
      throw new Error("Unauthorized: Invalid or missing authentication");
    }
  }
  
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
}
