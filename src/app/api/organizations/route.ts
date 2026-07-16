import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/ApiResponse";

export async function POST(request: NextRequest) {
  try {
    /*Authentication*/

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(new ApiResponse(401, "Unauthorized User"), {
        status: 401,
      });
    }

    /* Request Body*/

    const body = await request.json();

    const {
      clerkOrgId,
      name,
      slug,
    }: {
      clerkOrgId: string;
      name: string;
      slug?: string;
    } = body;

    if (!clerkOrgId || !name?.trim()) {
      return NextResponse.json(
        new ApiResponse(400, "Missing required fields"),
        {
          status: 400,
        },
      );
    }

    /* Generate Slug */

    const organizationSlug =
      slug?.trim().toLowerCase() ||
      name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    /* Check Existing Records  */

    const [existingOrganization, user] = await Promise.all([
      prisma.organization.findUnique({
        where: {
          clerkOrgId,
        },
      }),

      prisma.user.findUnique({
        where: {
          clerkUserId: userId,
        },
      }),
    ]);

    if (existingOrganization) {
      return NextResponse.json(
        new ApiResponse(
          409,
          "Organization already exists",
          existingOrganization,
        ),
        {
          status: 409,
        },
      );
    }

    if (!user) {
      return NextResponse.json(
        new ApiResponse(404, "User not found in database"),
        {
          status: 404,
        },
      );
    }

    /* Create Organization  */

    const organization = await prisma.$transaction(async (tx) => {
      const newOrganization = await tx.organization.create({
        data: {
          clerkOrgId,
          name: name.trim(),
          slug: organizationSlug,
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: newOrganization.id,
          userId: user.id,
          role: "owner",
        },
      });

      return newOrganization;
    });

    /*  Response */

    return NextResponse.json(
      new ApiResponse(201, "Organization created successfully", organization),
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Organization Creation Error:", error);

    return NextResponse.json(new ApiResponse(500, "Internal Server Error"), {
      status: 500,
    });
  }
}
