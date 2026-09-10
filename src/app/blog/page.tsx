'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Newspaper, Clock, Eye, Heart, MessageCircle, User,
  Tag, ArrowRight, Search, Calendar
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Section, SectionHeader, GlassCard, Badge, Button,
  LoadingSpinner, EmptyState, Input
} from '@/components/ui';
import { BlogSkeleton } from '@/components/ui/Skeleton';
import { formatDate } from '@/lib/utils';

const BLOG_CATEGORIES = [
  { value: '', label: 'All Posts' },
  { value: 'news', label: '📰 News' },
  { value: 'tutorial', label: '📖 Tutorials' },
  { value: 'industry', label: '🏭 Industry' },
  { value: 'event', label: '🎉 Events' },
  { value: 'announcement', label: '📢 Announcements' },
];

const categoryColors: Record<string, string> = {
  news: 'text-blue-400 bg-blue-500/10',
  tutorial: 'text-green-400 bg-green-500/10',
  industry: 'text-purple-400 bg-purple-500/10',
  event: 'text-yellow-400 bg-yellow-500/10',
  announcement: 'text-red-400 bg-red-500/10',
};

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [category, page]);

  useEffect(() => {
    // Fetch featured posts
    fetch('/api/blog?featured=true&limit=3')
      .then(res => res.json())
      .then(data => setFeaturedPosts(data.data?.posts || []))
      .catch(() => {});
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      params.set('page', String(page));
      params.set('limit', '9');

      const res = await fetch(`/api/blog?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.data?.posts || []);
        setTotalPages(data.data?.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 circuit-overlay opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge variant="accent" className="mb-4">📰 Robotix Stories & Updates</Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">
              Robotix <span className="text-gradient">Insights</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Follow Robotix Institute updates, partnership highlights, learner showcases,
              school activities, and practical robotics stories from Zambia.
            </p>
          </motion.div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-brand-accent/50"
              />
            </div>
          </form>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {featuredPosts.map((post: any, i: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <GlassCard hover className="h-full p-0 overflow-hidden">
                      {post.thumbnail ? (
                        <div className="h-48 bg-gradient-to-br from-brand-accent/20 to-brand-secondary/20 flex items-center justify-center">
                          <Newspaper className="w-12 h-12 text-white/20" />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-brand-accent/20 to-brand-secondary/20 flex items-center justify-center">
                          <Newspaper className="w-12 h-12 text-white/20" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[post.category] || 'text-white/60 bg-white/5'}`}>
                            {post.category}
                          </span>
                          <Badge variant="accent">Featured</Badge>
                        </div>
                        <h3 className="text-lg font-heading font-semibold text-white mb-2 line-clamp-2">{post.title}</h3>
                        <p className="text-sm text-white/50 mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {post.author?.firstName} {post.author?.lastName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Posts Listing */}
      <Section>
        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.value
                  ? 'bg-brand-accent text-brand-dark'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <BlogSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Newspaper className="w-8 h-8" />}
            title="No Posts Yet"
            description="Robotix stories, partnership highlights, learner showcases, and institute updates will appear here as the public content library grows."
          />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any, i: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <GlassCard hover className="h-full p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[post.category] || 'text-white/60 bg-white/5'}`}>
                          {post.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-heading font-semibold text-white mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-white/50 mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {post.author?.firstName} {post.author?.lastName}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{post.likes}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post._count?.comments || 0}</span>
                        </div>
                      </div>
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {post.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/40">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-white/40 px-4">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </Section>

      <Footer />
    </main>
  );
}
