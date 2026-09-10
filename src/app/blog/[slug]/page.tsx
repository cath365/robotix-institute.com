'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Eye, Heart, MessageCircle, Calendar,
  User, Tag, Share2, Clock
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Section, GlassCard, Badge, Button, LoadingSpinner
} from '@/components/ui';
import { useAuthStore } from '@/store';
import { formatDate } from '@/lib/utils';

export default function BlogPostPage() {
  const params = useParams();
  const { isAuthenticated, token } = useAuthStore();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetch(`/api/blog/${params.slug}`)
        .then(res => res.json())
        .then(data => setPost(data.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [params.slug]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !token || !post) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: comment, postId: post.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setPost((prev: any) => ({
          ...prev,
          comments: [data.data, ...prev.comments],
          _count: { ...prev._count, comments: prev._count.comments + 1 },
        }));
        setComment('');
      }
    } catch {} finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-dark text-white">
        <Navbar />
        <div className="pt-32"><LoadingSpinner /></div>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-brand-dark text-white">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-heading font-bold text-white mb-4">Post Not Found</h1>
          <Link href="/blog"><Button>Back to Blog</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      <section className="pt-28 pb-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to blog
          </Link>

          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="accent">{post.category}</Badge>
                {post.tags?.map((tag: string) => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full bg-white/5 text-xs text-white/40">#{tag}</span>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">{post.title}</h1>
              <p className="text-lg text-white/60 mb-6">{post.excerpt}</p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-sm font-bold">
                    {post.author?.firstName?.charAt(0)}{post.author?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{post.author?.firstName} {post.author?.lastName}</p>
                    <p className="text-xs text-white/40">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{post.views} views</span>
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{post.likes} likes</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{post._count?.comments || 0}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <GlassCard className="p-8 mb-8">
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="text-white/80 leading-relaxed whitespace-pre-wrap">{post.content}</div>
              </div>
            </GlassCard>

            {/* Comments */}
            <div className="mb-8">
              <h2 className="text-xl font-heading font-semibold text-white mb-6">
                Comments ({post._count?.comments || 0})
              </h2>

              {isAuthenticated ? (
                <form onSubmit={handleComment} className="mb-8">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:border-brand-accent/50 resize-y min-h-[100px]"
                  />
                  <div className="flex justify-end mt-3">
                    <Button type="submit" loading={submitting} disabled={!comment.trim()}>
                      Post Comment
                    </Button>
                  </div>
                </form>
              ) : (
                <GlassCard className="p-4 mb-8 text-center">
                  <p className="text-sm text-white/50">
                    <Link href="/login" className="text-brand-accent hover:underline">Sign in</Link> to leave a comment
                  </p>
                </GlassCard>
              )}

              <div className="space-y-4">
                {post.comments?.map((c: any) => (
                  <GlassCard key={c.id} className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-brand-secondary/50 flex items-center justify-center text-xs font-bold">
                        {c.user?.firstName?.charAt(0)}{c.user?.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{c.user?.firstName} {c.user?.lastName}</p>
                        <p className="text-[10px] text-white/30">{formatDate(c.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/70 pl-11">{c.content}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      <Footer />
    </main>
  );
}
