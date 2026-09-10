export const onboardingTracks = [
  {
    id: 'student',
    title: 'Student Creator',
    summary: 'Jump into lessons, games, challenges, and an innovation portfolio that grows with every build.',
    destination: '/learn',
    spotlight: 'Best for daily missions, coding, robotics, and competitions.',
  },
  {
    id: 'school',
    title: 'School Operator',
    summary: 'Launch robotics clubs, track student progress, register competitions, and manage school-wide rollouts.',
    destination: '/partners',
    spotlight: 'Best for principals, STEM coordinators, and robotics club leads.',
  },
  {
    id: 'parent',
    title: 'Parent Guide',
    summary: 'Follow streaks, celebrate badges, review projects, and spot safe next steps without digging through dashboards.',
    destination: '/dashboard',
    spotlight: 'Best for progress visibility, motivation, and home support.',
  },
  {
    id: 'innovator',
    title: 'Innovator Builder',
    summary: 'Prototype AI tools, publish experiments, and turn lab ideas into visible creator work.',
    destination: '/build',
    spotlight: 'Best for makers, developers, and community contributors.',
  },
  {
    id: 'startup',
    title: 'Startup Catalyst',
    summary: 'Use the ecosystem as a launchpad for pilots, media reach, school partnerships, and talent discovery.',
    destination: '/community',
    spotlight: 'Best for founders, mentors, and ecosystem partners.',
  },
] as const;

export const languageRoadmap = [
  { name: 'English', status: 'Live now', detail: 'Primary interface for courses, dashboards, and AI guidance.' },
  { name: 'Bemba', status: 'Roadmap', detail: 'Planned support for guided prompts, onboarding, and school flows.' },
  { name: 'Nyanja', status: 'Roadmap', detail: 'Planned support for family updates, beginner missions, and help content.' },
  { name: 'Swahili', status: 'Roadmap', detail: 'Planned support for regional ecosystem collaboration and AI help.' },
] as const;

export const connectivityModes = [
  {
    title: 'Immersive Mode',
    signal: 'Full experience',
    detail: 'Realtime dashboards, 3D labs, media, AI copilots, and live multiplayer surfaces.',
  },
  {
    title: 'Lite Mode',
    signal: 'Low-bandwidth ready',
    detail: 'Compressed visuals, reduced motion, faster assets, and mission-first content for weaker connections.',
  },
  {
    title: 'Offline Sync',
    signal: 'Field friendly',
    detail: 'Draft progress, queue uploads, and sync creator work once connectivity returns.',
  },
] as const;

export const challengeArcs = [
  {
    title: 'First Robot Launch',
    xp: '120 XP',
    detail: 'Build your first rover mission, log it in your portfolio, and unlock a hardware badge.',
  },
  {
    title: 'AI for Farmers',
    xp: '180 XP',
    detail: 'Create a crop insight prototype using sensors, weather cues, and an AI helper prompt.',
  },
  {
    title: 'PlayVerse Builder Jam',
    xp: '220 XP',
    detail: 'Design a STEM mini-game, test it with peers, and publish it to the community feed.',
  },
  {
    title: 'School Innovation League',
    xp: '300 XP',
    detail: 'Compete as a team across coding, robotics, and presentation missions with leaderboard rewards.',
  },
] as const;

export const creatorPipelines = [
  {
    title: 'Community Publish',
    detail: 'Turn ideas, code, and prototypes into visible discussions with comments and reactions.',
    destination: '/community',
  },
  {
    title: 'PlayVerse Release',
    detail: 'Ship educational games, challenge builds, and polished learning experiences for other creators.',
    destination: '/play',
  },
  {
    title: 'Media Spotlight',
    detail: 'Promote innovation stories, showcases, and documentaries through the content hub.',
    destination: '/blog',
  },
  {
    title: 'School Showcase',
    detail: 'Highlight club projects, competitions, and ecosystem pilots for schools and partners.',
    destination: '/partners',
  },
] as const;

export const futureAfricaNodes = [
  {
    city: 'Lusaka',
    country: 'Zambia',
    focus: 'AI + Robotics headquarters',
    status: 'Core node',
    signal: '92% live systems',
  },
  {
    city: 'Ndola',
    country: 'Zambia',
    focus: 'Manufacturing and automation labs',
    status: 'Rolling out',
    signal: '18 school pilots',
  },
  {
    city: 'Nairobi',
    country: 'Kenya',
    focus: 'Startup and developer exchange',
    status: 'Regional bridge',
    signal: '14 mentor links',
  },
  {
    city: 'Kigali',
    country: 'Rwanda',
    focus: 'Smart city and edtech missions',
    status: 'Future node',
    signal: '6 planned activations',
  },
  {
    city: 'Accra',
    country: 'Ghana',
    focus: 'Creator economy and STEM media',
    status: 'Future node',
    signal: '9 content partnerships',
  },
] as const;

export const schoolModules = [
  {
    title: 'Club Operating System',
    detail: 'Manage robotics clubs, attendance, missions, team structures, and hardware inventory from one surface.',
  },
  {
    title: 'Teacher Command Center',
    detail: 'Assign lessons, follow streaks, view AI usage, and support differentiated learning journeys.',
  },
  {
    title: 'Competition Engine',
    detail: 'Register teams, track submissions, monitor judging windows, and publish winning innovations.',
  },
  {
    title: 'Family Loop',
    detail: 'Send parent-ready updates, achievement digests, and event alerts in a cleaner communication flow.',
  },
  {
    title: 'Resource Vault',
    detail: 'Distribute lesson kits, printable worksheets, safety guides, and low-bandwidth learning packs.',
  },
] as const;

export const builderTemplates = [
  {
    title: 'School Website Kit',
    category: 'Education',
    detail: 'Generate a branded school innovation portal with clubs, events, and analytics.',
  },
  {
    title: 'Robot Dashboard',
    category: 'Robotics',
    detail: 'Create a telemetry board for motors, sensors, battery levels, and mission alerts.',
  },
  {
    title: 'Smart Irrigation App',
    category: 'AgriTech',
    detail: 'Spin up an irrigation control panel with weather, soil, and pump automation logic.',
  },
  {
    title: 'AI Support Bot',
    category: 'AI',
    detail: 'Launch a chatbot for FAQs, school onboarding, and learning recommendations.',
  },
  {
    title: 'Arduino Prototype Pack',
    category: 'Hardware',
    detail: 'Generate starter sketches, pin maps, and sensor workflows for embedded systems.',
  },
  {
    title: 'Competition Tracker',
    category: 'Operations',
    detail: 'Build a scoreboard and submission workflow for hackathons, leagues, and demo days.',
  },
] as const;

export const familySignals = [
  {
    title: 'Weekly Summary',
    detail: 'Parents see lessons completed, streak status, published work, and one recommended next step.',
  },
  {
    title: 'Safe Visibility',
    detail: 'Family-facing updates stay simple and human, without exposing confusing admin tooling.',
  },
  {
    title: 'Celebration Triggers',
    detail: 'Badges, certificates, and challenge unlocks become shareable milestone moments at home.',
  },
] as const;

export const simulationBoards = [
  {
    title: 'Arduino Uno Rover',
    detail: 'Classic entry setup for motors, LEDs, line sensors, and serial debugging.',
  },
  {
    title: 'ESP32 Field Node',
    detail: 'WiFi-enabled automation board for smart agriculture, dashboards, and sensor telemetry.',
  },
  {
    title: 'Autonomous Maze Bot',
    detail: 'Mission pack focused on path planning, obstacle scans, and logic loops.',
  },
] as const;

export const simulationSensors = [
  'Ultrasonic range finder',
  'Soil moisture probe',
  'Temperature and humidity node',
  'Light sensor',
  'Motor driver bridge',
  'Line tracking array',
] as const;

export const ecosystemSignals = [
  { label: 'Schools connected', value: '48', detail: 'robotics clubs and dashboards online' },
  { label: 'Live devices', value: '312', detail: 'IoT, agriculture, and learning systems reporting' },
  { label: 'Weekly AI assists', value: '9.6k', detail: 'coding, tutoring, and project generation prompts' },
  { label: 'Published projects', value: '1.8k', detail: 'games, prototypes, research, and student showcases' },
] as const;
