import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify the user owns this course
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId
      }
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const publishedCourse = await db.course.update({
      where: {
        id: params.courseId,
        userId: userId
      },
      data: {
        isPublished: true
      }
    });
    const publishCourseChapters = await db.chapter.updateMany({
      where: {
        courseId: params.courseId
      },
      data: {
        isPublished: true
      }
    })
    return NextResponse.json({
      ...publishedCourse,
      chapters: publishCourseChapters
    });
  } catch (error) {
    console.log("[COURSE_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

