import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { deleteFromBlob } from "@/services/blob/blob";
import { ApiResponse } from "@/types/ApiResponse";

interface RouteParams {
  params: Promise<{
    documentid: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    /* Authentication */

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(new ApiResponse(401, "Unauthorized user"), {
        status: 401,
      });
    }

    /* Params */

    const { documentid } = await params;

    /* Find Document */

    const document = await prisma.document.findUnique({
      where: {
        id: documentid,
      },
      include: {
        organization: {
          select: {
            members: {
              where: {
                user: {
                  clerkUserId: userId,
                },
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(new ApiResponse(404, "Document not found"), {
        status: 404,
      });
    }

    /* Permission Check */

    const isMember = document.organization.members.length > 0;

    if (!isMember) {
      return NextResponse.json(
        new ApiResponse(
          403,
          "You do not have permission to delete this document",
        ),
        {
          status: 403,
        },
      );
    }

    /* Save Blob URL Before Delete */

    const blobUrl = document.fileUrl;

    /* Delete From Database */

    await prisma.document.delete({
      where: {
        id: documentid,
      },
    });

    /* Delete From Blob No blocking */

    if (blobUrl) {
      await deleteFromBlob(blobUrl).catch((error) => {
        console.error(
          `Failed to delete blob for document ${documentid}:`,
          error,
        );
      });
    }

    /* Success */

    return NextResponse.json(
      new ApiResponse(200, "Document deleted successfully", {
        id: documentid,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Delete Document Error:", error);

    return NextResponse.json(
      new ApiResponse(500, "Failed to delete document"),
      {
        status: 500,
      },
    );
  }
}
