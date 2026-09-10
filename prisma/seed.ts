// Database Seed Script
// Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
// Or add to package.json: "prisma": { "seed": "ts-node prisma/seed.ts" }

import { PrismaClient, Role, GameProjectStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { GAME_LAB_STARTER_CODE } from '../src/constants/game-lab-template';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Create Admin User ────────────────────────────────────
  console.log('Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@robotix.com' },
    update: {},
    create: {
      email: 'admin@robotix.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // ─── Create Instructor ────────────────────────────────────
  const instructorPassword = await bcrypt.hash('instructor123', 12);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@robotix.com' },
    update: {},
    create: {
      email: 'instructor@robotix.com',
      password: instructorPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'INSTRUCTOR',
      bio: 'Senior Robotics Engineer with 10+ years of experience in autonomous systems.',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`  ✓ Instructor: ${instructor.email}`);

  // ─── Create Test Student ──────────────────────────────────
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@robotix.com' },
    update: {},
    create: {
      email: 'student@robotix.com',
      password: studentPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'STUDENT',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log(`  ✓ Student: ${student.email}`);

  // ─── Create Courses ───────────────────────────────────────
  console.log('\nCreating courses...');
  
  const courses = [
    {
      title: 'Introduction to Robotics',
      slug: 'intro-to-robotics',
      description: 'Learn the fundamentals of robotics, from basic concepts to building your first robot. Perfect for beginners with no prior experience.',
      price: 0,
      level: 'beginner',
      category: 'Robotics',
      duration: 480,
      published: true,
      featured: true,
    },
    {
      title: 'Arduino Programming Masterclass',
      slug: 'arduino-programming',
      description: 'Master Arduino programming from scratch. Build real-world projects including sensors, motors, and IoT devices.',
      price: 299,
      level: 'intermediate',
      category: 'Programming',
      duration: 720,
      published: true,
      featured: true,
    },
    {
      title: 'PID Control Systems',
      slug: 'pid-control-systems',
      description: 'Deep dive into PID controllers. Learn to tune and implement feedback control systems for precise robot movement.',
      price: 499,
      level: 'advanced',
      category: 'Control Systems',
      duration: 600,
      published: true,
    },
    {
      title: 'Computer Vision for Robots',
      slug: 'computer-vision-robots',
      description: 'Implement computer vision using OpenCV and Python. Object detection, tracking, and autonomous navigation.',
      price: 599,
      level: 'advanced',
      category: 'AI & ML',
      duration: 900,
      published: true,
    },
    {
      title: 'IoT with ESP32',
      slug: 'iot-esp32',
      description: 'Build connected IoT devices with ESP32. WiFi, Bluetooth, MQTT, and cloud integration.',
      price: 349,
      level: 'intermediate',
      category: 'IoT',
      duration: 540,
      published: true,
      featured: true,
    },
    {
      title: 'ROS2 for Beginners',
      slug: 'ros2-beginners',
      description: 'Get started with Robot Operating System 2. Build modular robot software with industry-standard tools.',
      price: 449,
      level: 'intermediate',
      category: 'Robotics',
      duration: 660,
      published: true,
    },
  ];

  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: {
        ...courseData,
        instructorId: instructor.id,
      },
    });
    console.log(`  ✓ Course: ${course.title}`);
  }

  // ─── Create Products ──────────────────────────────────────
  console.log('\nCreating products...');
  
  const products = [
    {
      name: 'Arduino Starter Kit',
      slug: 'arduino-starter-kit',
      description: 'Complete Arduino Uno starter kit with sensors, LEDs, motors, and components.',
      price: 599,
      salePrice: 499,
      category: 'Kits',
      stock: 50,
      featured: true,
      specs: JSON.stringify({
        'Board': 'Arduino Uno R3',
        'Components': '65+ pieces',
        'Projects': '15+ guided projects',
      }),
    },
    {
      name: 'ESP32 DevKit V1',
      slug: 'esp32-devkit',
      description: 'ESP32 development board with WiFi and Bluetooth. Perfect for IoT projects.',
      price: 149,
      category: 'Boards',
      stock: 100,
      featured: true,
      specs: JSON.stringify({
        'CPU': 'Dual-core 240MHz',
        'Memory': '520KB SRAM',
        'WiFi': '802.11 b/g/n',
        'Bluetooth': 'BLE 4.2',
      }),
    },
    {
      name: 'Ultrasonic Sensor HC-SR04',
      slug: 'ultrasonic-hc-sr04',
      description: 'Ultrasonic distance sensor for obstacle detection. Range: 2cm - 400cm.',
      price: 29,
      category: 'Sensors',
      stock: 200,
      specs: JSON.stringify({
        'Range': '2cm - 400cm',
        'Accuracy': '3mm',
        'Trigger': '10μs pulse',
      }),
    },
    {
      name: 'Robot Car Chassis Kit',
      slug: 'robot-car-chassis',
      description: '4WD robot car chassis with motors, wheels, and battery holder.',
      price: 199,
      salePrice: 149,
      category: 'Kits',
      stock: 30,
      specs: JSON.stringify({
        'Motors': '4x DC gear motors',
        'Wheels': '4x 65mm wheels',
        'Material': 'Acrylic chassis',
      }),
    },
    {
      name: 'Servo Motor SG90',
      slug: 'servo-sg90',
      description: 'Micro servo motor for precise angular control. 0-180 degrees.',
      price: 39,
      category: 'Components',
      stock: 150,
      specs: JSON.stringify({
        'Torque': '1.8kg/cm',
        'Speed': '0.1s/60°',
        'Rotation': '180°',
      }),
    },
    {
      name: 'Raspberry Pi 4 Model B',
      slug: 'raspberry-pi-4',
      description: 'Raspberry Pi 4 with 4GB RAM. The ultimate single-board computer for robotics.',
      price: 899,
      category: 'Boards',
      stock: 25,
      featured: true,
      specs: JSON.stringify({
        'CPU': 'Quad-core Cortex-A72',
        'RAM': '4GB LPDDR4',
        'USB': '2x USB 3.0, 2x USB 2.0',
        'Display': 'Dual micro-HDMI',
      }),
    },
    {
      name: 'Mini FPV Drone Kit',
      slug: 'mini-fpv-drone',
      description: 'Build your own FPV racing drone. Includes frame, motors, and flight controller.',
      price: 1299,
      salePrice: 999,
      category: 'Drones',
      stock: 15,
      featured: true,
      specs: JSON.stringify({
        'Frame': '5" carbon fiber',
        'Motors': '2306 2400KV',
        'FC': 'F4 with OSD',
        'Camera': '1200TVL FPV',
      }),
    },
    {
      name: 'L298N Motor Driver',
      slug: 'l298n-motor-driver',
      description: 'Dual H-bridge motor driver module for DC motors and stepper motors.',
      price: 49,
      category: 'Components',
      stock: 100,
      specs: JSON.stringify({
        'Channels': '2 DC motors or 1 stepper',
        'Voltage': '5V-35V',
        'Current': '2A per channel',
      }),
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });
    console.log(`  ✓ Product: ${product.name}`);
  }

  // ─── Create Games ─────────────────────────────────────────
  console.log('\nCreating games...');
  
  const games = [
    {
      name: 'Maze Navigator',
      slug: 'maze-navigator',
      description: 'Navigate your robot through increasingly complex mazes.',
      type: 'maze',
      difficulty: 'easy',
      maxScore: 1000,
    },
    {
      name: 'Line Follower Challenge',
      slug: 'line-follower',
      description: 'Program your robot to follow the line as fast as possible.',
      type: 'line_follower',
      difficulty: 'medium',
      maxScore: 1500,
    },
    {
      name: 'Drone Racing League',
      slug: 'drone-racing',
      description: 'Race through checkpoints in the fastest time.',
      type: 'drone_nav',
      difficulty: 'hard',
      maxScore: 2000,
    },
    {
      name: 'Robot Soccer',
      slug: 'robot-soccer',
      description: 'Score goals while avoiding the opponent robot.',
      type: 'robot_soccer',
      difficulty: 'hard',
      maxScore: 2500,
    },
  ];

  for (const gameData of games) {
    const game = await prisma.game.upsert({
      where: { slug: gameData.slug },
      update: {},
      create: gameData,
    });
    console.log(`  ✓ Game: ${game.name}`);
  }

  // ─── Create Competitions ──────────────────────────────────
  console.log('\nCreating competitions...');
  
  const now = new Date();
  const competitions = [
    {
      title: 'Robotix Championship 2026',
      slug: 'robotix-championship-2026',
      description: 'The annual robotics competition. Build an autonomous robot to complete the challenge.',
      rules: '1. Robots must be autonomous\n2. Max size: 30x30x30cm\n3. Teams of 2-4 members',
      startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      status: 'upcoming',
      maxTeamSize: 4,
      prizes: JSON.stringify({
        first: 'K5,000 + Arduino Mega Kit',
        second: 'K3,000 + ESP32 Kit',
        third: 'K1,500 + Sensor Pack',
      }),
    },
    {
      title: 'IoT Innovation Challenge',
      slug: 'iot-innovation-2026',
      description: 'Create an innovative IoT solution for smart agriculture.',
      rules: '1. Use ESP32 or similar\n2. Must include cloud connectivity\n3. Practical application required',
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      status: 'active',
      maxTeamSize: 3,
      prizes: JSON.stringify({
        first: 'K3,000 + Raspberry Pi 4 Kit',
        second: 'K1,500 + ESP32 Kit',
        third: 'K750 + Sensor Pack',
      }),
    },
  ];

  for (const compData of competitions) {
    const competition = await prisma.competition.upsert({
      where: { slug: compData.slug },
      update: {},
      create: compData,
    });
    console.log(`  ✓ Competition: ${competition.title}`);
  }

  // ─── Create Achievements ──────────────────────────────────
  console.log('\nCreating achievements...');
  
  const achievements = [
    { name: 'First Steps', description: 'Complete your first course', icon: '🎓', category: 'learning', points: 10, criteria: '{"courses_completed": 1}' },
    { name: 'Code Warrior', description: 'Create 10 code projects', icon: '💻', category: 'coding', points: 25, criteria: '{"code_projects": 10}' },
    { name: 'Robot Builder', description: 'Complete a robot project', icon: '🤖', category: 'robotics', points: 30, criteria: '{"robot_projects": 1}' },
    { name: 'Community Star', description: 'Post 10 forum posts', icon: '⭐', category: 'community', points: 20, criteria: '{"forum_posts": 10}' },
    { name: 'Competition Winner', description: 'Win a competition', icon: '🏆', category: 'competition', points: 100, criteria: '{"competition_wins": 1}' },
    { name: 'IoT Pioneer', description: 'Connect your first IoT device', icon: '📡', category: 'iot', points: 15, criteria: '{"iot_devices": 1}' },
    { name: 'Game Master', description: 'Score 1000 points in arena', icon: '🎮', category: 'gaming', points: 20, criteria: '{"arena_score": 1000}' },
  ];

  for (const achievementData of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievementData.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        ...achievementData,
        id: achievementData.name.toLowerCase().replace(/\s+/g, '-'),
      },
    });
    console.log(`  ✓ Achievement: ${achievementData.name}`);
  }

  // ─── Create Forum Categories ──────────────────────────────
  console.log('\nCreating forum categories...');
  
  const forumCategories = [
    { id: 'general', name: 'General Discussion', slug: 'general-discussion', description: 'General robotics discussion' },
    { id: 'help', name: 'Help & Support', slug: 'help-support', description: 'Get help with your projects' },
    { id: 'projects', name: 'Project Showcase', slug: 'project-showcase', description: 'Share your robotics projects' },
    { id: 'tutorials', name: 'Tutorials', slug: 'tutorials', description: 'Community tutorials and guides' },
    { id: 'competitions', name: 'Competitions', slug: 'competitions', description: 'Competition discussion' },
    { id: 'buy-sell', name: 'Buy & Sell', slug: 'buy-sell', description: 'Marketplace for components' },
  ];

  for (const catData of forumCategories) {
    await prisma.forumCategory.upsert({
      where: { id: catData.id },
      update: {},
      create: catData,
    });
    console.log(`  ✓ Forum Category: ${catData.name}`);
  }

  // ─── Sample student Game Lab project (published demo) ─────────
  console.log('\nCreating demo Game Lab project...');
  await prisma.gameProject.upsert({
    where: { slug: 'robotix-collect-demo' },
    update: {},
    create: {
      userId: student.id,
      title: 'Robotix Collect',
      slug: 'robotix-collect-demo',
      description: 'Move the yellow circle with arrow keys. Collect the white star. Seeded example for the Game Lab.',
      code: GAME_LAB_STARTER_CODE,
      tags: 'tutorial,phaser,starter',
      status: GameProjectStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });
  console.log('  ✓ Game Lab demo: /game-gallery?view=robotix-collect-demo');

  console.log('\n✅ Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('  Admin: admin@robotix.com / admin123');
  console.log('  Instructor: instructor@robotix.com / instructor123');
  console.log('  Student: student@robotix.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
