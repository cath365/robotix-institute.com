'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Section,
  GlassCard,
  Badge,
  Button,
  ProgressBar,
  LoadingSpinner,
  EmptyState,
} from '@/components/ui';
import {
  ArrowLeft,
  Play,
  Clock,
  Users,
  Star,
  CheckCircle,
  Lock,
  FileText,
  Video,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';
import { useApi, useAuth } from '@/hooks/useApi';

interface CourseLesson {
  id: string;
  title: string;
  duration: number;
  type: string;
  order: number;
}

interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

interface CoursePayload {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  price: number;
  level: string;
  category: string;
  duration: number;
  published: boolean;
  instructor: {
    firstName: string;
    lastName: string;
    avatar?: string | null;
    bio?: string | null;
  };
  modules: CourseModule[];
  totalDuration: number;
  totalLessons: number;
  enrolledCount: number;
  viewerEnrollment?: { progress: number; completed: boolean } | null;
  completedLessonIds?: string[];
  viewerCertificate?: { certCode: string; title: string; issueDate: string } | null;
}

const lessonTypeIcons: Record<string, ReactNode> = {
  video: <Video className="w-4 h-4 text-blue-400" />,
  text: <FileText className="w-4 h-4 text-green-400" />,
  quiz: <HelpCircle className="w-4 h-4 text-yellow-400" />,
  assignment: <BookOpen className="w-4 h-4 text-purple-400" />,
};

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { get, post } = useApi();

  const [course, setCourse] = useState<CoursePayload | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [lessonBusy, setLessonBusy] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setLoadErr(null);
    try {
      const res = await get<CoursePayload>(`/courses/${slug}`, { requireAuth: true });
      if (res.data) {
        setCourse(res.data);
        const first = res.data.modules[0]?.id;
        setExpandedModules(first ? [first] : []);
      } else {
        setLoadErr('Course not found');
      }
    } catch (e: unknown) {
      setLoadErr(e instanceof Error ? e.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [slug, get]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const completedSet = useMemo(
    () => new Set(course?.completedLessonIds ?? []),
    [course?.completedLessonIds]
  );

  const totalLessons = course?.totalLessons ?? 0;
  const completedLessons = useMemo(() => completedSet.size, [completedSet]);
  const progressPct = totalLessons
    ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
    : 0;

  const enrollmentProgressPct = course?.viewerEnrollment
    ? Math.round((course.viewerEnrollment.progress ?? 0) * 100)
    : progressPct;

  const displayProgress = course?.viewerEnrollment ? enrollmentProgressPct : progressPct;

  const toggleModule = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleEnroll = async () => {
    if (!isAuthenticated || !course) {
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }
    setEnrolling(true);
    try {
      await post('/enrollments', { courseId: course.id });
      toast.success(`Enrolled in ${course.title}`);
      await fetchCourse();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not enrol';
      if (msg.includes('already enrolled')) {
        toast.success('You are already enrolled');
        await fetchCourse();
      } else {
        toast.error(msg);
      }
    } finally {
      setEnrolling(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!isAuthenticated || !course?.viewerEnrollment) {
      toast.error('Enrol in this course first');
      return;
    }
    if (completedSet.has(lessonId)) return;

    setLessonBusy(lessonId);
    try {
      type ProgressRes = {
        courseProgressApprox?: number;
        lessonId?: string;
        certificate?: { certCode: string; title: string; issueDate: string } | null;
      };
      const res = await post<ProgressRes>(`/lessons/${lessonId}/progress`, {
        completed: true as const,
      });
      toast.success('+10 pts · Lesson complete!');
      const approx = res.data?.courseProgressApprox;

      setCourse((c) => {
        if (!c) return c;
        const nextIds = [...(c.completedLessonIds ?? []), lessonId];
        const uniq = [...new Set(nextIds)];
        return {
          ...c,
          completedLessonIds: uniq,
          viewerEnrollment: c.viewerEnrollment
            ? {
                ...c.viewerEnrollment,
                progress:
                  typeof approx === 'number' ? Math.min(1, approx / 100) : c.viewerEnrollment.progress,
                completed:
                  typeof approx === 'number'
                    ? approx >= 99
                    : c.viewerEnrollment.completed,
              }
            : c.viewerEnrollment,
        };
      });
      await fetchCourse();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Could not save progress');
    } finally {
      setLessonBusy(null);
    }
  };

  const instructorName = course
    ? `${course.instructor.firstName} ${course.instructor.lastName}`
    : '';
  const instructorInitials = course
    ? `${course.instructor.firstName?.charAt(0) ?? '?'}${course.instructor.lastName?.charAt(0) ?? ''}`
    : '';

  if (loading) {
    return (
      <main className="bg-brand-dark min-h-screen">
        <Navbar />
        <div className="pt-40 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </main>
    );
  }

  if (loadErr || !course) {
    return (
      <main className="bg-brand-dark min-h-screen">
        <Navbar />
        <Section className="pt-32 pb-24">
          <EmptyState
            icon={<BookOpen className="w-8 h-8" />}
            title="Course not available"
            description={loadErr || 'This course may have been unpublished or removed.'}
            action={
              <Link href="/courses">
                <Button variant="primary">Browse courses</Button>
              </Link>
            }
          />
        </Section>
        <Footer />
      </main>
    );
  }

  const totalHoursApprox = Math.max(1, Math.round(course.totalDuration / 60));

  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />

      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="circuit-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Badge variant={course.level === 'beginner' ? 'primary' : 'accent'} className="mb-4">
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Badge>
              <Badge variant="success" className="mb-4 ml-2">
                {course.category}
              </Badge>
              <h1 className="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">
                {course.title}
              </h1>
              <p className="text-white/60 mb-6 whitespace-pre-line">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-white/50 mb-6">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> ~{totalHoursApprox}{' '}
                  {totalHoursApprox === 1 ? 'hour' : 'hours'} ({course.totalDuration} min content)
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {course.enrolledCount.toLocaleString()} enrolments
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-brand-accent" /> Self-paced
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> {course.totalLessons} lessons
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-xs font-bold text-white">
                  {course.instructor.avatar ? (
                    <span className="sr-only">{instructorName}</span>
                  ) : null}
                  {!course.instructor.avatar ? instructorInitials : null}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{instructorName}</div>
                  {course.instructor.bio ? (
                    <div className="text-xs text-white/40 line-clamp-2">{course.instructor.bio}</div>
                  ) : null}
                </div>
              </div>
            </div>

            <div>
              <GlassCard className="p-6 sticky top-24">
                <div className="text-center mb-6">
                  {course.price === 0 ? (
                    <div className="text-3xl font-heading font-bold text-brand-accent">FREE</div>
                  ) : (
                    <div className="text-3xl font-heading font-bold text-white">K{course.price}</div>
                  )}
                </div>

                <div className="mb-4">
                  <ProgressBar value={displayProgress} showLabel />
                  <p className="text-xs text-white/40 mt-1">
                    {completedLessons} of {course.totalLessons} lessons marked complete
                  </p>
                </div>

                {!isAuthenticated ? (
                  <Link href={`/login?redirect=/courses/${slug}`}>
                    <Button variant="primary" className="w-full mb-3" icon={<Play className="w-4 h-4" />}>
                      Sign in to start
                    </Button>
                  </Link>
                ) : !course.viewerEnrollment ? (
                  <Button
                    variant="primary"
                    className="w-full mb-3"
                    icon={<Play className="w-4 h-4" />}
                    onClick={handleEnroll}
                    loading={enrolling}
                  >
                    {course.price > 0 ? 'Enrol & checkout' : 'Enrol free'}
                  </Button>
                ) : (
                  <Button variant="primary" className="w-full mb-3" icon={<Play className="w-4 h-4" />} disabled>
                    {displayProgress >= 99 ? 'Course complete!' : 'Keep going'}
                  </Button>
                )}

                {course.viewerCertificate ? (
                  <Link href={`/verify/${course.viewerCertificate.certCode}`}>
                    <Button variant="secondary" className="w-full" icon={<Award className="w-4 h-4" />}>
                      View Certificate
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full opacity-70"
                    disabled
                    icon={<Award className="w-4 h-4" />}
                  >
                    {displayProgress >= 99 ? 'Issuing certificate...' : 'Certificate unlocks at 100%'}
                  </Button>
                )}

                {course.viewerCertificate ? (
                  <p className="mt-3 text-center text-[11px] text-white/45">
                    Verification code: {course.viewerCertificate.certCode}
                  </p>
                ) : null}

                {!course.viewerEnrollment && (
                  <p className="text-[11px] text-white/35 mt-3 text-center">
                    Complete lessons while signed in — you earn ✨ institute points (+10 each).
                  </p>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      <Section className="py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h3 className="font-heading text-lg font-semibold text-white mb-4">How this course works</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Expand each module, work through lessons in order, and tap <strong>Mark complete</strong> when you
                have finished each one. Progress syncs automatically to your dashboard.
              </p>
            </GlassCard>

            <div>
              <h3 className="font-heading text-lg font-semibold text-white mb-4">Curriculum</h3>
              <div className="space-y-3">
                {course.modules.map((module) => (
                  <GlassCard key={module.id} className="overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center text-sm font-bold text-brand-accent">
                          {module.order}
                        </div>
                        <div>
                          <h4 className="font-heading font-semibold text-white text-sm">{module.title}</h4>
                          <p className="text-xs text-white/40">
                            {module.lessons.length} lessons ·{' '}
                            {module.lessons.reduce((a, l) => a + l.duration, 0)} min
                          </p>
                        </div>
                      </div>
                      {expandedModules.includes(module.id) ? (
                        <ChevronUp className="w-5 h-5 text-white/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/40" />
                      )}
                    </button>
                    {expandedModules.includes(module.id) && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="border-t border-white/5">
                        {module.lessons.map((lesson) => {
                          const done = completedSet.has(lesson.id);
                          const canInteract = !!(isAuthenticated && course.viewerEnrollment);
                          const busy = lessonBusy === lesson.id;
                          const iconKey = lesson.type in lessonTypeIcons ? lesson.type : 'text';

                          return (
                            <div
                              key={lesson.id}
                              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {done ? (
                                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                ) : (
                                  (lessonTypeIcons[iconKey] ?? lessonTypeIcons.text)
                                )}
                                <span
                                  className={`text-sm truncate ${done ? 'text-white/50 line-through' : 'text-white/85'}`}
                                >
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-white/30">{lesson.duration} min</span>
                                {!canInteract ? (
                                  <span title="Enrol first" className="text-white/20">
                                    <Lock className="w-4 h-4" />
                                  </span>
                                ) : done ? (
                                  <Badge variant="success" className="text-[10px]">
                                    Done
                                  </Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    loading={busy}
                                    onClick={() => markLessonComplete(lesson.id)}
                                  >
                                    Mark complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h3 className="font-heading font-semibold text-white mb-4">Included</h3>
              <ul className="space-y-3 text-sm text-white/60">
                {[
                  'Structured modules with clear milestones',
                  'Video, written, quiz, and project lessons',
                  'Progress saved to your account',
                  'Points toward institute leaderboards',
                  'Reuse anytime after enrolment',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-heading font-semibold text-white mb-4">Build & share</h3>
              <p className="text-sm text-white/55 mb-3">
                Turn ideas into playable Phaser.js games and submit them from the studio.
              </p>
              <Link href="/game-lab">
                <Button variant="secondary" size="sm" className="w-full">
                  Open Game Lab
                </Button>
              </Link>
            </GlassCard>
          </div>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
