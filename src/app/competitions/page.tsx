'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Section, SectionHeader, GlassCard, Badge, Button, ProgressBar } from '@/components/ui';
import { Trophy, Users, Calendar, Clock, Award, ChevronRight, CheckCircle, Target, Zap } from 'lucide-react';

const competitions = [
  {
    id: '1', slug: 'zambia-robotics-challenge-2026',
    title: 'Zambia Robotics Challenge 2026',
    description: 'The premier national robotics competition for students across Zambia. Design, build, and program a robot to complete a series of challenges.',
    status: 'active',
    startDate: '2026-04-15',
    endDate: '2026-06-30',
    maxTeamSize: 4,
    teamsRegistered: 47,
    maxTeams: 100,
    prizes: 'K50,000',
    categories: ['Autonomous Navigation', 'Line Following', 'Object Manipulation'],
    thumbnail: '🏆',
  },
  {
    id: '2', slug: 'iot-innovation-hackathon',
    title: 'IoT Innovation Hackathon',
    description: 'Build innovative IoT solutions for real-world problems in agriculture, healthcare, and infrastructure using ESP32 and sensors.',
    status: 'upcoming',
    startDate: '2026-07-01',
    endDate: '2026-08-15',
    maxTeamSize: 3,
    teamsRegistered: 12,
    maxTeams: 50,
    prizes: 'K25,000',
    categories: ['Smart Agriculture', 'Healthcare IoT', 'Smart Infrastructure'],
    thumbnail: '🌐',
  },
  {
    id: '3', slug: 'drone-challenge-2026',
    title: 'Drone Programming Challenge',
    description: 'Program autonomous drones to complete aerial missions including mapping, delivery, and precision navigation.',
    status: 'upcoming',
    startDate: '2026-09-01',
    endDate: '2026-10-30',
    maxTeamSize: 3,
    teamsRegistered: 0,
    maxTeams: 30,
    prizes: 'K30,000',
    categories: ['Aerial Mapping', 'Precision Landing', 'Autonomous Delivery'],
    thumbnail: '🚁',
  },
  {
    id: '4', slug: 'ai-robotics-olympiad',
    title: 'AI Robotics Olympiad',
    description: 'Build robots that use machine learning and computer vision to solve complex real-world challenges.',
    status: 'completed',
    startDate: '2025-10-01',
    endDate: '2025-12-15',
    maxTeamSize: 4,
    teamsRegistered: 35,
    maxTeams: 40,
    prizes: 'K40,000',
    categories: ['Object Detection', 'Path Planning', 'Natural Language Command'],
    thumbnail: '🧠',
  },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  upcoming: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-white/10 text-white/40',
  judging: 'bg-yellow-500/20 text-yellow-400',
};

export default function CompetitionsPage() {
  return (
    <main className="bg-brand-dark min-h-screen">
      <Navbar />

      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="circuit-overlay" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="accent" className="mb-4">
              <Trophy className="w-3 h-3 mr-1" /> National Competitions
            </Badge>
            <h1 className="section-title mb-4">
              Robotics <span className="gradient-text">Competitions</span>
            </h1>
            <p className="section-subtitle mx-auto">
              Compete in national robotics challenges, form teams, submit projects, and win prizes.
            </p>
          </motion.div>
        </div>
      </section>

      <Section className="py-8">
        <div className="space-y-6">
          {competitions.map((comp, i) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard hover className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Icon */}
                  <div className="text-6xl lg:text-7xl flex-shrink-0 text-center">{comp.thumbnail}</div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-heading text-xl font-bold text-white">{comp.title}</h3>
                      <span className={`badge ${statusColors[comp.status]}`}>
                        {comp.status.charAt(0).toUpperCase() + comp.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-white/50 mb-4">{comp.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {comp.categories.map((cat) => (
                        <Badge key={cat} variant="primary">{cat}</Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 rounded-xl bg-white/5">
                        <Calendar className="w-4 h-4 mx-auto text-brand-accent mb-1" />
                        <div className="text-xs text-white/40">Start Date</div>
                        <div className="text-sm font-semibold text-white">{new Date(comp.startDate).toLocaleDateString('en-ZM', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-white/5">
                        <Users className="w-4 h-4 mx-auto text-brand-accent mb-1" />
                        <div className="text-xs text-white/40">Teams</div>
                        <div className="text-sm font-semibold text-white">{comp.teamsRegistered} / {comp.maxTeams}</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-white/5">
                        <Target className="w-4 h-4 mx-auto text-brand-accent mb-1" />
                        <div className="text-xs text-white/40">Team Size</div>
                        <div className="text-sm font-semibold text-white">Up to {comp.maxTeamSize}</div>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-white/5">
                        <Award className="w-4 h-4 mx-auto text-brand-accent mb-1" />
                        <div className="text-xs text-white/40">Prize Pool</div>
                        <div className="text-sm font-semibold text-brand-accent">{comp.prizes}</div>
                      </div>
                    </div>

                    {comp.maxTeams > 0 && (
                      <div className="mb-4">
                        <ProgressBar
                          value={(comp.teamsRegistered / comp.maxTeams) * 100}
                          showLabel
                        />
                      </div>
                    )}

                    <div className="flex gap-3">
                      {comp.status === 'active' && (
                        <Button variant="primary" size="sm" icon={<Trophy className="w-4 h-4" />}>
                          Register Team
                        </Button>
                      )}
                      {comp.status === 'upcoming' && (
                        <Button variant="secondary" size="sm" icon={<Zap className="w-4 h-4" />}>
                          Notify Me
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Section>

      <Footer />
    </main>
  );
}
