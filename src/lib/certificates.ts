import prisma from '@/lib/prisma';
import { generateCertCode } from '@/lib/utils';

export async function ensureCourseCertificate(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { completed: true },
  });

  if (!enrollment?.completed) return null;

  const [existing, course] = await Promise.all([
    prisma.certificate.findFirst({
      where: { userId, courseId },
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    }),
  ]);

  if (existing) return existing;
  if (!course) return null;

  return prisma.certificate.create({
    data: {
      userId,
      courseId,
      title: `${course.title} Completion Certificate`,
      certCode: generateCertCode(),
    },
  });
}
