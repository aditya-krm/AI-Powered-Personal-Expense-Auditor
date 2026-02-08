"use server";

import { prisma } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function deleteTransaction(id: number) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
}
