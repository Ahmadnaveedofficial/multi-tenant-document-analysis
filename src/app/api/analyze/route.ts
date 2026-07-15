import { prisma } from "@/lib/prisma";
import { analyzeWithGemini } from "@/services/ai/gemini";
import { ApiResponse } from "@/types/ApiResponse";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    /* Authentication */

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(new ApiResponse(401, "Unauthorized User"), {
        status: 401,
      });
    }

    /*Request Body  */

    const body = await request.json();

    const {
      documentId,
      organizationId,
      analysisType,
    }: {
      documentId: string;
      organizationId: string;
      analysisType: "summary" | "qa" | "sentiment" | "extract";
    } = body;

    if (!documentId || !organizationId || !analysisType) {
      return NextResponse.json(
        new ApiResponse(400, "Missing required fields"),
        {
          status: 400,
        },
      );
    }

    /* Find Document*/

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organization: {
          clerkOrgId: organizationId,
          members: {
            some: {
              user: {
                clerkUserId: userId,
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

    /* Get Content  */

    const content = document.content || document.name;

    if (!content || content.trim().length < 5) {
      return NextResponse.json(
        new ApiResponse(400, "Document has no content to analyze"),
        {
          status: 400,
        },
      );
    }

    /* AI Analysis*/

    const result = await analyzeWithGemini(content, analysisType);

    /*  Save Result  */

    const updatedDocument = await prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        aiSummary: result,
        aiKeywords: ["analyzed"],
        sentiment: analysisType,
      },
    });

    return NextResponse.json(
      new ApiResponse(200, "Document analyzed successfully", {
        analysis: result,
        document: {
          id: updatedDocument.id,
          name: updatedDocument.name,
          aiSummary: updatedDocument.aiSummary,
          aiKeywords: updatedDocument.aiKeywords,
          sentiment: updatedDocument.sentiment,
        },
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Analyze Document Error:", error);

    return NextResponse.json(new ApiResponse(500, "Internal Server Error"), {
      status: 500,
    });
  }
}
