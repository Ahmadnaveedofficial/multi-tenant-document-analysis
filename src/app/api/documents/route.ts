import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { uploadToBlob } from "@/services/blob/blob";
import { ApiResponse } from "@/types/ApiResponse";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    /* Authentication*/

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(new ApiResponse(401, "Unauthorized User"), {
        status: 401,
      });
    }

    /* Form Data */

    const formData = await request.formData();

    const name = formData.get("name") as string;
    const content = formData.get("content") as string;
    const clerkOrgId = formData.get("clerkOrgId") as string;
    const file = formData.get("file") as File | null;

    if (!clerkOrgId || !name?.trim()) {
      return NextResponse.json(
        new ApiResponse(400, "Missing required fields"),
        { status: 400 },
      );
    }

    /* Parallel Database Queries */

    const [organization, user] = await Promise.all([
      prisma.organization.findUnique({
        where: {
          clerkOrgId,
        },
      }),

      prisma.user.findUnique({
        where: {
          clerkUserId: userId,
        },
        include: {
          memberships: true,
        },
      }),
    ]);

    /* Validations */

    if (!organization) {
      return NextResponse.json(new ApiResponse(404, "Organization not found"), {
        status: 404,
      });
    }

    if (!user) {
      return NextResponse.json(new ApiResponse(404, "User not found"), {
        status: 404,
      });
    }

    const isMember = user.memberships.some(
      (membership) => membership.organizationId === organization.id,
    );

    if (!isMember) {
      return NextResponse.json(
        new ApiResponse(403, "You are not a member of this organization"),
        {
          status: 403,
        },
      );
    }

    /* File Validation */

    if (file && file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        new ApiResponse(400, "File size must be less than 10MB"),
        {
          status: 400,
        },
      );
    }

    /*  Upload File To Blob */

    let fileUrl: string | null = null;
    let fileSize = 0;
    let fileType = "unknown";

    let extractedContent = content?.trim() || "";

    if (file && file.size > 0) {
      const blob = await uploadToBlob(file, organization.id, user.id);

      fileUrl = blob.url;
      fileSize = file.size;
      fileType = file.type || "unknown";

      // Extract text automatically
      if (!extractedContent && file.type.startsWith("text/")) {
        extractedContent = await file.text();
      }
    }

    /*  Document Validation */

    if (!extractedContent && !fileUrl) {
      return NextResponse.json(
        new ApiResponse(
          400,
          "Please provide document content or upload a file.",
        ),
        {
          status: 400,
        },
      );
    }

    /*  Save Document*/

    const document = await prisma.$transaction(async (tx) => {
      return await tx.document.create({
        data: {
          name: name.trim(),
          content: extractedContent || null,
          fileUrl,
          fileSize,
          fileType,
          organizationId: organization.id,
          userId: user.id,
          aiKeywords: [],
        },

        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },

          organization: {
            select: {
              name: true,
              clerkOrgId: true,
            },
          },
        },
      });
    });

    /*  Response Object */

    const response = {
      id: document.id,
      name: document.name,
      content: document.content,
      fileUrl: document.fileUrl,
      fileSize: document.fileSize,
      fileType: document.fileType,

      organization: {
        name: document.organization.name,
        clerkOrgId: document.organization.clerkOrgId,
      },

      uploadedBy: {
        name: document.user.name,
        email: document.user.email,
      },

      createdAt: document.createdAt,
    };

    return NextResponse.json(
      new ApiResponse(201, "Document uploaded successfully", response),
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Create Document Error:", error);

    return NextResponse.json(
      new ApiResponse(500, "Failed to upload document"),
      {
        status: 500,
      },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    /*  Authentication*/

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(new ApiResponse(401, "Unauthorized User"), {
        status: 401,
      });
    }

    /*  Query Parameters*/

    const { searchParams } = new URL(request.url);

    const clerkOrgId = searchParams.get("organizationId");

    if (!clerkOrgId) {
      return NextResponse.json(
        new ApiResponse(400, "organizationId query parameter is required"),
        {
          status: 400,
        },
      );
    }

    /*Parallel Queries */

    const [organization, user] = await Promise.all([
      prisma.organization.findUnique({
        where: {
          clerkOrgId,
        },
      }),

      prisma.user.findUnique({
        where: {
          clerkUserId: userId,
        },
        include: {
          memberships: true,
        },
      }),
    ]);

    /*   Validations*/

    if (!organization) {
      return NextResponse.json(new ApiResponse(404, "Organization not found"), {
        status: 404,
      });
    }

    if (!user) {
      return NextResponse.json(new ApiResponse(404, "User not found"), {
        status: 404,
      });
    }

    const isMember = user.memberships.some(
      (membership) => membership.organizationId === organization.id,
    );

    if (!isMember) {
      return NextResponse.json(
        new ApiResponse(403, "You are not a member of this organization"),
        {
          status: 403,
        },
      );
    }

    /*  Fetch Documents */

    const documents = await prisma.document.findMany({
      where: {
        organizationId: organization.id,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        organization: {
          select: {
            id: true,
            name: true,
            clerkOrgId: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    /* Format Response*/

    const formattedDocuments = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      content: doc.content,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      fileType: doc.fileType,

      aiSummary: doc.aiSummary,
      aiKeywords: doc.aiKeywords,
      sentiment: doc.sentiment,

      createdAt: doc.createdAt,

      uploadedBy: {
        id: doc.user.id,
        name: doc.user.name,
        email: doc.user.email,
      },

      organization: {
        id: doc.organization.id,
        name: doc.organization.name,
        clerkOrgId: doc.organization.clerkOrgId,
      },
    }));

    /*  Metadata */

    const metadata = {
      organizationId: organization.id,
      organizationName: organization.name,
      clerkOrgId: organization.clerkOrgId,
      totalDocuments: formattedDocuments.length,
    };

    /* Success Response */

    return NextResponse.json(
      new ApiResponse(200, "Documents fetched successfully", {
        documents: formattedDocuments,
        metadata,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Get Documents Error:", error);

    return NextResponse.json(new ApiResponse(500, "Internal Server Error"), {
      status: 500,
    });
  }
}
