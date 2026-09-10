export interface SchoolProjectStory {
  id: string;
  slug: string;
  title: string;
  schoolName: string;
  periodLabel: string;
  createdAt: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageSrc: string;
  imageAlt: string;
  description: string;
  projectFocus: string;
  components: string[];
  learningOutcomes: string[];
  evidence: string[];
  story: string[];
  sourceLinks: Array<{
    label: string;
    href: string;
  }>;
}

export const schoolProjects: SchoolProjectStory[] = [
  {
    id: 'school-project-1',
    slug: 'french-international-coding-classes',
    title: 'French International School Coding and Programming Classes',
    schoolName: 'French International School in Lusaka',
    periodLabel: 'June 9, 2020 public launch',
    createdAt: '2020-06-09',
    category: 'School Project',
    difficulty: 'beginner',
    imageSrc: 'https://www.robotixinstitute.io/assets/uploads/media-uploader/021590862766.jpg',
    imageAlt: 'Robotix project image used in the French International School coding classes announcement.',
    description:
      'Robotix publicly announced coding and programming classes at the French International School in Lusaka, framing the work as an early-school technology pathway built around visual programming and robotics.',
    projectFocus: 'Foundational coding and robotics classes for school-aged learners.',
    components: ['Scratch', 'Visual programming', 'Robotics basics', 'Simple circuits', 'Sensors', 'Motors'],
    learningOutcomes: [
      'Students started with visual programming using Scratch and learned to create games, animations, and interactive stories.',
      'They progressed toward robotics coding, including simple circuits and understanding how sensors and motors work.',
      'The program was designed to strengthen problem-solving, critical thinking, creativity, and teamwork.',
    ],
    evidence: [
      'Robotix said the classes combined visual programming and robotics in an age-appropriate, hands-on curriculum.',
      'The announcement explicitly said students would move from Scratch into coding for robots, simple circuits, sensors, and motors.',
      'Robotix positioned the program as a foundation for real-world applications where students could program their own robots.',
    ],
    story: [
      'This was one of Robotix Institute’s earliest public school project signals. The emphasis was not just on exposure to coding, but on helping children use technology to create things for themselves.',
      'The project started with visual programming to make the learning curve friendly, then connected that work to robotics, sensors, and simple hardware thinking. That matters because it shows Robotix treating coding as something students can see, test, and apply.',
      'For parents and schools, the project tells a clear story: Robotix was already trying to turn abstract technology into hands-on classroom confidence as early as 2020.',
    ],
    sourceLinks: [
      {
        label: 'Robotix French International School launch article',
        href: 'https://www.robotixinstitute.io/blog/new-organization-are-continually-added-and-seal-there-single',
      },
    ],
  },
  {
    id: 'school-project-2',
    slug: 'northmead-tessa-robotics-program',
    title: 'Northmead Tessa Robotics and Coding Program',
    schoolName: 'Northmead Primary School',
    periodLabel: 'Five-month program, highlighted in February 2025',
    createdAt: '2025-02-26',
    category: 'School Project',
    difficulty: 'intermediate',
    imageSrc: 'https://www.robotixinstitute.io/assets/uploads/media-uploader/robotix3.jpg',
    imageAlt: 'Robotix and Northmead-linked STEAM partnership image from public coverage.',
    description:
      'In partnership with Stanbic Bank Zambia, Robotix introduced 40 Grade 5 learners at Northmead Primary School to robotics and coding through a five-month hands-on STEAM program centered on Tessa and Tessa Blocks.',
    projectFocus: 'Hands-on robotics, block-based coding, and first exposure to digital technology.',
    components: ['Tessa robot', 'Tessa Blocks', 'Ultrasonic sensors', 'Motors', 'Driver boards', 'AI Day exposure'],
    learningOutcomes: [
      'Students assembled and programmed Tessa, an obstacle-avoidance robot, using Robotix’s own Tessa Blocks platform.',
      'They learned how ultrasonic sensors, motors, and driver boards work together inside a real robotics system.',
      'The project gave many learners their first direct exposure to modern digital technology and later extended into AI Day conversations about how artificial intelligence shapes industries.',
    ],
    evidence: [
      'Robotix said the program introduced 40 Grade 5 students to coding and robotics over five months.',
      'The Stanbic-linked article says students built and coded Tessa while assembling ultrasonic sensors, motors, and driver boards.',
      'Robotix also said the learning journey took students to Stanbic Bank Zambia’s AI Day, extending the project beyond basic robotics into broader future-tech awareness.',
    ],
    story: [
      'Northmead is one of the strongest public examples of Robotix doing more than running a club. The program combined software, electronics, and structured teaching over multiple months, which makes it feel like a real school transformation project rather than a one-day event.',
      'The work was practical. Learners did not only hear about robotics; they assembled a robot, used a block-based coding tool, and watched hardware respond to the code they created.',
      'Just as important, the project built a bridge from foundational robotics into AI awareness through the AI Day experience. That shows Robotix trying to help children connect small classroom builds to bigger technology futures.',
    ],
    sourceLinks: [
      {
        label: 'Robotix year of innovation and impact',
        href: 'https://www.robotixinstitute.io/blog/robotix-institute-a-year-of-innovation-impact',
      },
      {
        label: 'Stanbic CSR award article',
        href: 'https://www.robotixinstitute.io/blog/stanbic-bank-zambia-csr-award-robotix-institute',
      },
      {
        label: 'Robotix community initiatives page',
        href: 'https://www.robotixinstitute.io/service/community-iniiatives',
      },
    ],
  },
  {
    id: 'school-project-3',
    slug: 'lics-smart-house-challenge',
    title: 'LICS Smart House Challenge',
    schoolName: 'LICS (publicly named that way by Robotix)',
    periodLabel: 'Publicly highlighted on February 18, 2025',
    createdAt: '2025-02-18',
    category: 'School Project',
    difficulty: 'intermediate',
    imageSrc: 'https://www.robotixinstitute.io/assets/uploads/media-uploader/041595315299.jpg',
    imageAlt: 'Robotix project image used in the Year of Innovation and Impact article.',
    description:
      'Robotix said it pushed creativity through a Smart House Challenge at LICS, where students designed homes with sensors and security features.',
    projectFocus: 'Applied design challenge around smart homes, sensing, and real-world problem solving.',
    components: ['Sensors', 'Security features', 'Smart home concepts', 'Design challenge thinking'],
    learningOutcomes: [
      'Students designed homes with sensors and security features, which means they worked with the logic of connected systems rather than isolated devices.',
      'The challenge pushed creativity while grounding it in real-world home automation and safety thinking.',
      'The project exposed students to how sensors can be used in practical environments, not just in abstract lessons.',
    ],
    evidence: [
      'Robotix explicitly described the activity as a Smart House Challenge at LICS.',
      'The public summary says students designed homes with sensors and security features.',
      'Robotix framed the challenge as part of a wider year of innovation and impact, which places it alongside their larger school and youth-technology work.',
    ],
    story: [
      'This project matters because it shows Robotix moving from basic coding lessons into systems thinking. Instead of only asking students to code small behaviors, the challenge invited them to imagine how technology should behave inside a home.',
      'The smart-house framing also gives schools and parents something concrete: students were learning how sensors can serve real people in real spaces, which is one of the clearest bridges from classroom creativity to engineering thinking.',
      'Even though the public write-up is short, it is still one of Robotix’s clearest project-style school references because it names a challenge, a context, and the kind of ideas students had to work through.',
    ],
    sourceLinks: [
      {
        label: 'Robotix year of innovation and impact',
        href: 'https://www.robotixinstitute.io/blog/robotix-institute-a-year-of-innovation-impact',
      },
    ],
  },
];

export function getSchoolProjectBySlug(slug: string) {
  return schoolProjects.find((project) => project.slug === slug) ?? null;
}
