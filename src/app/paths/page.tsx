'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Map, Clock, Users, ChevronRight, Filter, GraduationCap,
  Zap, Star, BookOpen, ArrowRight, CheckCircle
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Section, SectionHeader, GlassCard, Badge, Button,
  LoadingSpinner, EmptyState, Input, Select
} from '@/components/ui';

const PATH_CATEGORIES = [
  'All',
  'Robotics Fundamentals',
  'IoT & Embedded',
  'AI & Machine Learning',
  'Drone Technology',
  'Smart Agriculture',
  'Competition Prep',
];

const difficultyColors: Record<string, string> = {
  beginner: 'text-green-400 bg-green-500/10 border-green-500/20',
  intermediate: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const difficultyIcons: Record<string, React.ReactNode> = {
  beginner: <Star className="w-3.5 h-3.5" />,
  intermediate: <Zap className="w-3.5 h-3.5" />,
  advanced: <GraduationCap className="w-3.5 h-3.5" />,
};

// Featured paths for the hero section
const featuredPaths = [
  {
    title: 'Beginner to Robot Builder',
    description: 'A complete journey from zero robotics knowledge to building your first autonomous robot.',
    steps: 8,
    duration: '12 weeks',
    enrolled: 342,
    difficulty: 'beginner',
    icon: '🤖',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    title: 'IoT Mastery Path',
    description: 'Master ESP32, MQTT, sensors, and cloud connectivity to build smart IoT systems.',
    steps: 10,
    duration: '16 weeks',
    enrolled: 218,
    difficulty: 'intermediate',
    icon: '📡',
    gradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    title: 'AI Robotics Engineer',
    description: 'Combine machine learning, computer vision, and robotics for intelligent systems.',
    steps: 12,
    duration: '20 weeks',
    enrolled: 156,
    difficulty: 'advanced',
    icon: '🧠',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
];

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    fetchPaths();
  }, [category, difficulty]);

  const fetchPaths = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.set('category', category);
      if (difficulty) params.set('difficulty', difficulty);
      const res = await fetch(`/api/paths?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPaths(data.data?.paths || []);
      }
    } catch (err) {
      console.error('Failed to fetch paths:', err);
    } finally {
      setLoading(false);
    }
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
            className="text-center mb-16"
          >
            <Badge variant="accent" className="mb-4">🗺️ Learning Paths</Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">
              Your Roadmap to <span className="text-gradient">Mastery</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Follow guided learning journeys that connect courses, projects, and challenges
              in the perfect sequence to achieve your robotics goals.
            </p>
          </motion.div>

          {/* Featured Paths */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {featuredPaths.map((path, i) => (
              <motion.div
                key={path.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard hover className="h-full p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${path.gradient} flex items-center justify-center text-2xl mb-4`}>
                    {path.icon}
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-3 ${difficultyColors[path.difficulty]}`}>
                    {difficultyIcons[path.difficulty]}
                    {path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1)}
                  </div>
                  <h3 className="text-lg font-heading font-semibold text-white mb-2">{path.title}</h3>
                  <p className="text-sm text-white/50 mb-4 line-clamp-2">{path.description}</p>
                  <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                    <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{path.steps} steps</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{path.duration}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{path.enrolled}</span>
                  </div>
                  <div className="flex items-center text-brand-accent text-sm font-medium group">
                    Start Path <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Path Listing */}
      <Section>
        <SectionHeader
          badge="All Paths"
          title="Choose Your Journey"
          subtitle="Browse all available learning paths and find the one that matches your goals."
        />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {PATH_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-brand-accent text-brand-dark'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : paths.length === 0 ? (
          <EmptyState
            icon={<Map className="w-8 h-8" />}
            title="No Paths Yet"
            description="Learning paths are being created. Check back soon or explore our courses!"
            action={<Link href="/courses"><Button>Browse Courses</Button></Link>}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path: any, i: number) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/paths/${path.slug}`}>
                  <GlassCard hover className="h-full p-6">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-3 ${difficultyColors[path.difficulty] || difficultyColors.beginner}`}>
                      {path.difficulty}
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-white mb-2">{path.title}</h3>
                    <p className="text-sm text-white/50 mb-4 line-clamp-2">{path.description}</p>
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{path._count?.steps || 0} steps</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{path.duration}h</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{path._count?.enrollments || 0}</span>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* How It Works */}
      <Section withPattern>
        <SectionHeader
          badge="How It Works"
          title="Follow the Path"
          subtitle="Learning paths guide you step-by-step through a curated journey."
        />
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '01', title: 'Choose a Path', desc: 'Pick a learning path that matches your skill level and goals.' },
            { step: '02', title: 'Follow the Steps', desc: 'Complete courses, projects, and challenges in the recommended order.' },
            { step: '03', title: 'Track Progress', desc: 'See your progress on a visual roadmap as you advance through each step.' },
            { step: '04', title: 'Earn Certificate', desc: 'Complete the path to earn a certificate and unlock achievements.' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent font-heading font-bold text-lg">
                {item.step}
              </div>
              <h3 className="text-lg font-heading font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/50">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Footer />
    </main>
  );
}
