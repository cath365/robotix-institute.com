# Robotix Institute - Zambia's Premier Robotics Education Platform

## Overview
The most advanced robotics education platform in Zambia and Africa, combining robotics education, coding playground, simulation, gamified learning, IoT robot control, competitions, and more.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Three.js, Framer Motion, Monaco Editor
- **Backend**: Next.js API Routes, PostgreSQL, Prisma ORM
- **Real-time**: WebSockets, MQTT for IoT
- **Auth**: JWT with Role-based Access Control

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Seed database
npx prisma db seed

# Apply schema changes
npx prisma db push

# Run development server
npm run dev
```

To enable production-grade password reset emails and inbox notifications, add the `RESEND_*` and `CONTACT_INBOX_EMAIL` values from `.env.example`.

### Game Lab (Phaser + Monaco)

After seeding, visit **Game Lab** (sign in as a student): create projects, edit code, and submit for admin review. Published games appear under **Game Gallery** and are playable at `/game-lab/play/[slug]`.

The seed includes a demo published project slug `robotix-collect-demo` when `prisma db seed` runs successfully.

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Dashboard pages
│   ├── courses/           # LMS system
│   ├── playground/        # Coder Play Station
│   ├── simulation/        # Robotics Simulation Lab
│   ├── arena/             # Game Arena
│   ├── projects/          # Project Library
│   ├── iot/               # IoT Control Center
│   ├── competitions/      # Competition Platform
│   ├── portfolio/         # Student Portfolios
│   ├── marketplace/       # Robotics Store
│   ├── community/         # Community Hub
│   ├── api/               # API Routes
│   └── admin/             # Admin Dashboard
├── components/            # Reusable UI components
├── lib/                   # Utility functions & configs
├── hooks/                 # Custom React hooks
├── store/                 # Zustand state management
└── types/                 # TypeScript type definitions
```

## Environment Variables
See `.env.example` for required variables.

## License
Proprietary - Robotix Institute Zambia
