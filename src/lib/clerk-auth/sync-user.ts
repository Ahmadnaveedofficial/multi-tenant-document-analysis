import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function syncUserToDatabase() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    const email =
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      "";

    const name =
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkUserId: clerkUser.id,
      },
    });

    if (existingUser) {
      return await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          email,
          name: name || existingUser.name,
        },
      });
    }

    const newUser = await prisma.user.create({
      data: {
        clerkUserId: clerkUser.id,
        email,
        name: name || "User",
      },
    });

    console.log(`✅ New user created: ${newUser.email}`);

    return newUser;
  } catch (error) {
    console.error("Error syncing Clerk user:", error);
    throw error;
  }
}
