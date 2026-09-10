export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Gamification lifetime points */
  points?: number;
  role: 'ADMIN' | 'ACCOUNTANT' | 'INSTRUCTOR' | 'STUDENT' | 'GUEST';
  avatar?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  level: string;
  category: string;
  duration: number;
  published: boolean;
  featured: boolean;
  instructor: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  modules?: CourseModule[];
  _count?: { enrollments: number };
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  order: number;
  type: string;
}

export interface CodeProject {
  id: string;
  title: string;
  language: string;
  code: string;
  isPublic: boolean;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface RobotProject {
  id: string;
  title: string;
  slug: string;
  description: string;
  components: string[];
  circuitUrl?: string;
  sourceCode?: string;
  tutorialMd?: string;
  videoUrl?: string;
  thumbnail?: string;
  category: string;
  difficulty: string;
  likes: number;
  views: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  thumbnail?: string;
  images: string[];
  stock: number;
  featured: boolean;
}

export interface Competition {
  id: string;
  title: string;
  slug: string;
  description: string;
  rules: string;
  startDate: string;
  endDate: string;
  status: string;
  maxTeamSize: number;
  thumbnail?: string;
}

export interface GameInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  thumbnail?: string;
  difficulty: string;
  maxScore: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  views: number;
  likes: number;
  createdAt: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  _count?: { comments: number };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
}

export interface IoTDevice {
  id: string;
  name: string;
  deviceType: string;
  mqttTopic: string;
  status: string;
  lastSeen?: string;
  sensorData?: Record<string, unknown>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export interface Notification {
  id: string;
  type: 'achievement' | 'course' | 'competition' | 'forum' | 'order' | 'system';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  difficulty: string;
  category: string;
  duration: number;
  published: boolean;
  featured: boolean;
  steps?: LearningPathStep[];
  _count?: { enrollments: number };
}

export interface LearningPathStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: 'course' | 'project' | 'quiz' | 'challenge';
  resourceId?: string;
  resourceUrl?: string;
  duration: number;
}

export interface PathEnrollment {
  id: string;
  currentStep: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  learningPath: LearningPath;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  views: number;
  likes: number;
  createdAt: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  _count?: { comments: number };
}

export interface BlogComment {
  id: string;
  content: string;
  createdAt: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
}

export interface SearchResult {
  type: 'course' | 'project' | 'blog' | 'forum' | 'product' | 'path';
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
}
