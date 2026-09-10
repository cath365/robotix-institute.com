import { Bot, Code2, Cpu, Gamepad2, type LucideIcon } from 'lucide-react';

export type LearningPathSlug = 'ai' | 'arduino' | 'programming' | 'game-dev';
export type LessonKind = 'ai' | 'arduino' | 'programming' | 'game-dev';

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  xp: number;
  kind: LessonKind;
  concept: string;
  example: string;
  tryIt: string;
  challenge: string;
  starterCode: string;
  language: 'javascript' | 'python';
  expectedOutput?: string;
}

export interface LearningPath {
  slug: LearningPathSlug;
  title: string;
  shortTitle: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  badge: 'AI Explorer' | 'Arduino Builder' | 'Code Starter' | 'Game Dev';
  description: string;
  accent: string;
  href: string;
  icon: LucideIcon;
  lessons: Lesson[];
}

export const learningPaths: LearningPath[] = [
  {
    slug: 'ai',
    title: 'AI Explorer Path',
    shortTitle: 'AI',
    level: 'Beginner',
    badge: 'AI Explorer',
    description: 'Teach a computer to notice patterns, make simple predictions, and explain decisions.',
    accent: 'from-cyan-400 to-fuchsia-500',
    href: '/learn/ai',
    icon: Bot,
    lessons: [
      {
        id: 'ai-patterns',
        title: 'How AI Spots Patterns',
        minutes: 4,
        xp: 80,
        kind: 'ai',
        concept:
          'AI learns from examples. If we give it labeled clues, it can compare new data with what it has seen before and make a useful guess.',
        example:
          'A fruit sorter can learn that round, red, sweet fruits are often apples, while long yellow fruits are often bananas.',
        tryIt:
          'Change the fruit clues in the code and run it. Watch how the simple classifier chooses a label.',
        challenge:
          'Add one more example for orange and make the program correctly classify it.',
        language: 'python',
        starterCode:
          'fruit = "red round sweet"\n\nif "yellow" in fruit:\n    print("banana")\nelif "red" in fruit and "round" in fruit:\n    print("apple")\nelse:\n    print("unknown fruit")',
        expectedOutput: 'apple',
      },
    ],
  },
  {
    slug: 'arduino',
    title: 'Arduino Builder Path',
    shortTitle: 'Arduino',
    level: 'Beginner',
    badge: 'Arduino Builder',
    description: 'Learn inputs, outputs, circuits, and control logic with a friendly board simulator.',
    accent: 'from-emerald-400 to-sky-500',
    href: '/learn/arduino',
    icon: Cpu,
    lessons: [
      {
        id: 'arduino-led-button',
        title: 'LEDs, Buttons, and Signals',
        minutes: 5,
        xp: 90,
        kind: 'arduino',
        concept:
          'Arduino programs read inputs and control outputs. A button is an input. An LED is an output. Your code decides what happens when the button changes.',
        example:
          'When the button is pressed, the LED receives a HIGH signal and glows. When released, it receives LOW and turns off.',
        tryIt:
          'Use the simulator button, then edit the JavaScript logic to make the LED blink twice.',
        challenge:
          'Complete the lesson after you can explain the difference between input and output.',
        language: 'javascript',
        starterCode:
          'const buttonPressed = true;\nconst led = buttonPressed ? "ON" : "OFF";\nconsole.log("LED is", led);',
        expectedOutput: 'LED is ON',
      },
    ],
  },
  {
    slug: 'programming',
    title: 'Programming Quest Path',
    shortTitle: 'Programming',
    level: 'Beginner',
    badge: 'Code Starter',
    description: 'Practice variables, conditions, loops, and functions through tiny playable missions.',
    accent: 'from-amber-300 to-rose-500',
    href: '/learn/programming',
    icon: Code2,
    lessons: [
      {
        id: 'programming-loops',
        title: 'Loops Save Time',
        minutes: 4,
        xp: 75,
        kind: 'programming',
        concept:
          'A loop repeats instructions. Instead of writing the same command many times, a loop lets the computer count and repeat for you.',
        example:
          'Game characters use loops to animate walking frames, spawn coins, and check collisions every round.',
        tryIt:
          'Change the loop count and run the code to print more robot steps.',
        challenge:
          'Make the robot count from 1 to 5 and print “mission complete” at the end.',
        language: 'javascript',
        starterCode:
          'for (let step = 1; step <= 3; step++) {\n  console.log("Robot step", step);\n}\nconsole.log("mission complete");',
        expectedOutput: 'Robot step 1',
      },
    ],
  },
  {
    slug: 'game-dev',
    title: 'Game Dev Path',
    shortTitle: 'Game Dev',
    level: 'Intermediate',
    badge: 'Game Dev',
    description: 'Build small browser game mechanics using player state, score, and challenge rules.',
    accent: 'from-violet-400 to-orange-400',
    href: '/learn/game-dev',
    icon: Gamepad2,
    lessons: [
      {
        id: 'game-score',
        title: 'Score Makes Games Feel Alive',
        minutes: 3,
        xp: 85,
        kind: 'game-dev',
        concept:
          'A game loop updates state. Score is state that changes when a player succeeds, collects an item, or solves a puzzle.',
        example:
          'A memory game adds points when two cards match. A coding puzzle adds points when the command sequence works.',
        tryIt:
          'Run the score code, then change the coin values to design a harder challenge.',
        challenge:
          'Make the final score reach at least 30 without changing the number of coins.',
        language: 'javascript',
        starterCode:
          'const coins = [10, 5, 10];\nlet score = 0;\ncoins.forEach((coin) => {\n  score += coin;\n});\nconsole.log("Score:", score);',
        expectedOutput: 'Score: 25',
      },
    ],
  },
];

export const getLearningPath = (slug: string) =>
  learningPaths.find((path) => path.slug === slug);

export const allLessons = learningPaths.flatMap((path) =>
  path.lessons.map((lesson) => ({ ...lesson, pathSlug: path.slug, pathTitle: path.title }))
);

export const xpForLevel = {
  Beginner: 0,
  Intermediate: 350,
  Advanced: 900,
};

export function getLevelFromXp(xp: number) {
  if (xp >= xpForLevel.Advanced) return 'Advanced';
  if (xp >= xpForLevel.Intermediate) return 'Intermediate';
  return 'Beginner';
}

export function getNextLevelProgress(xp: number) {
  if (xp >= xpForLevel.Advanced) return 100;
  const next = xp >= xpForLevel.Intermediate ? xpForLevel.Advanced : xpForLevel.Intermediate;
  const prev = xp >= xpForLevel.Intermediate ? xpForLevel.Intermediate : xpForLevel.Beginner;
  return Math.min(100, Math.round(((xp - prev) / (next - prev)) * 100));
}
