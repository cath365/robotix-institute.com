'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Puzzle,
  Sparkles,
  Star,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { RobotixBlocksLab } from '@/components/kids/RobotixBlocksLab';
import { Badge, Button, Section } from '@/components/ui';

const highlights = [
  {
    title: 'Big colorful blocks',
    text: 'Young children tap simple Robotix commands instead of typing code.',
    icon: Puzzle,
  },
  {
    title: 'Tiny win-based missions',
    text: 'Each puzzle teaches movement, turning, and simple sequencing through play.',
    icon: Star,
  },
  {
    title: 'Robotix-first identity',
    text: 'The whole flow stays inside Robotix, so children and parents never leave your platform.',
    icon: Bot,
  },
];

const skills = [
  'Sequence simple instructions',
  'Spot patterns and direction changes',
  'Debug by trying a new order',
  'Build confidence before text coding',
];

export default function RobotixBlocksPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#dff8ff_0%,#effcff_38%,#ffffff_100%)] text-slate-900">
      <Navbar />

      <section className="relative overflow-hidden pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(80,208,255,0.28),transparent_34%),radial-gradient(circle_at_top_right,rgba(17,152,122,0.18),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <Badge variant="accent" className="bg-white text-[#0f7288] shadow-sm">
                <Sparkles className="mr-1 h-3 w-3" />
                Robotix Blocks
              </Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-[#15313b] sm:text-5xl lg:text-6xl">
                A first coding playground for little Robotix learners.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#55737d]">
                This page is designed for young children to play with block-style coding inside the Robotix website,
                with bright commands, friendly missions, and no typing pressure.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="#blocks-lab">
                  <Button icon={<ArrowRight className="h-4 w-4" />} className="bg-[#0f7288] text-white hover:bg-[#0b6174]">
                    Start playing
                  </Button>
                </Link>
                <Link href="/weekend-classes">
                  <Button variant="secondary">Ask about weekend classes</Button>
                </Link>
              </div>
            </div>

            <div className="rounded-[36px] border border-white/70 bg-white/85 p-6 shadow-[0_28px_80px_rgba(74,164,188,0.18)] backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.title} className="rounded-[28px] bg-[#f3fbfd] p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff8ff] text-[#0f7288]">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-4 text-lg font-black text-[#17313b]">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#58737c]">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[28px] bg-[#17313b] p-5 text-white">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#89d8ea]">What children practice</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {skills.map((skill) => (
                    <div key={skill} className="rounded-2xl bg-white/8 px-4 py-3 text-sm">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section className="py-6" id="blocks-lab">
        <RobotixBlocksLab />
      </Section>

      <Section className="pt-4 pb-16">
        <div className="rounded-[36px] border border-[#cdebf4] bg-white p-8 shadow-[0_22px_60px_rgba(80,168,192,0.14)]">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">
            <div>
              <Badge variant="primary" className="bg-[#edfaff] text-[#0f7288]">
                Robotix pathway
              </Badge>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#17313b]">
                From first blocks to real building.
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#58737c]">
                Robotix publicly presents beginner pathways like Little Einsteins and Byte Buddies for younger learners.
                This playground gives families a gentle first step before moving into weekend sessions, Scratch-style
                logic, robotics kits, and deeper STEM projects.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/courses">
                <Button className="w-full bg-[#0f7288] text-white hover:bg-[#0b6174]">Explore Robotix programs</Button>
              </Link>
              <Link href="/weekend-classes">
                <Button className="w-full" variant="secondary">Sign up for weekend classes</Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Footer />
    </main>
  );
}
