import { robotixProfile } from '@/lib/robotix-profile';

export type SchoolStory = {
  slug: string;
  kind: 'school' | 'note' | 'spotlight';
  name: string;
  short: string;
  status: string;
  period: string;
  location: string;
  imageSrc: string;
  imageAlt: string;
  imageCaption: string;
  logoSrc?: string;
  logoAlt?: string;
  summary: string;
  highlight: string;
  lead: string;
  content: string[];
  evidence: string[];
  metrics: { label: string; value: string }[];
  sourceLinks: { label: string; href: string }[];
};

export const featuredSchoolStories: SchoolStory[] = [
  {
    slug: 'french-international-school-lusaka',
    kind: 'school',
    name: 'French International School in Lusaka',
    short: 'FIS',
    status: 'Confirmed public school program',
    period: 'June 9, 2020',
    location: 'Lusaka, Zambia',
    imageSrc: robotixProfile.officialMedia[0].src,
    imageAlt: 'Robotix learners collaborating around laptops during a coding session.',
    imageCaption:
      'Robotix publicly announced coding and programming classes at the French International School in Lusaka in June 2020.',
    summary:
      'Robotix launched a hands-on school program focused on visual programming, robotics, and creative problem-solving for learners at the French International School.',
    highlight:
      'This is one of the clearest early school partnerships documented on Robotix\'s own website.',
    lead:
      'The French International School story matters because it shows Robotix operating in a formal school setting very early in its public journey.',
    content: [
      'Robotix published a dedicated post announcing the start of coding and programming classes at the French International School in Lusaka. The public writeup frames the program as practical, age-appropriate, and designed to help learners create games, stories, and robotics projects instead of only consuming technology.',
      'The article also makes Robotix\'s broader educational philosophy visible. It talks about early exposure to technology as a way to build problem-solving, creativity, teamwork, and confidence. That makes this school partnership useful not just as a name on a list, but as evidence of the kind of classroom experience Robotix wanted to deliver.',
      'Because the post is dated June 9, 2020, it also acts as a strong timeline marker. It shows that Robotix was publicly positioning itself as a school-facing STEM education organization from the beginning, rather than adding school work much later.',
    ],
    evidence: [
      'Official Robotix blog post naming the school directly.',
      'Publicly dated June 9, 2020, giving the partnership a concrete timeline anchor.',
      'Describes visual programming and robotics as part of the school experience.',
    ],
    metrics: [
      { label: 'Public announcement', value: 'June 2020' },
      { label: 'School type', value: 'International school' },
      { label: 'Program style', value: 'Hands-on coding + robotics' },
    ],
    sourceLinks: [
      {
        label: 'Robotix Institute Launches Coding and Programming Classes at the French International School in Lusaka',
        href: 'https://www.robotixinstitute.io/blog/new-organization-are-continually-added-and-seal-there-single',
      },
      {
        label: 'Robotix Institute homepage',
        href: 'https://www.robotixinstitute.io/',
      },
      {
        label: 'Robotix after-school robotics article',
        href: 'https://www.robotixinstitute.io/blog/robotics-after-school-program',
      },
    ],
  },
  {
    slug: 'northmead-primary-school',
    kind: 'school',
    name: 'Northmead Primary School',
    short: 'NPS',
    status: 'Confirmed public-school pilot',
    period: '2024 pilot, covered February 18 and February 26, 2025',
    location: 'Lusaka, Zambia',
    imageSrc: robotixProfile.officialMedia[1].src,
    imageAlt: 'Students and partners pictured during the Stanbic-linked STEAM program.',
    imageCaption:
      'Robotix and Stanbic Bank Zambia publicly highlighted the Northmead robotics and coding pilot.',
    summary:
      'Robotix says it ran a five-month robotics and coding program at Northmead Primary School with Stanbic Bank Zambia, introducing 40 Grade 5 learners to Tessa, Tessa Blocks, and early digital skills.',
    highlight:
      'Northmead is the strongest public example of Robotix bringing sponsored STEM access into the public school system.',
    lead:
      'Northmead is the most detailed publicly documented school partnership in Robotix coverage because it combines named learners, timeline context, delivery details, and sponsor backing.',
    content: [
      'Robotix references Northmead Primary School in multiple public pieces, including its impact recap, its Stanbic partnership coverage, and its community initiatives page. Across those sources, the story stays consistent: a five-month robotics and coding program introduced 40 Grade 5 learners to robotics and digital skills.',
      'The program is notable because it goes beyond a one-day activation. Robotix describes the learners assembling and programming Tessa, using Tessa Blocks, and getting their first practical exposure to modern digital technology. That makes the school story feel like a real educational intervention rather than a simple event appearance.',
      'The Stanbic partnership also adds credibility and scale. Robotix links the school program to a wider corporate social impact initiative, showing how the organization presents itself as a delivery partner for institutions that want to support STEM access in public schools.',
    ],
    evidence: [
      'Repeatedly named in Robotix impact and CSR coverage.',
      'Robotix cites a five-month program and 40 Grade 5 learners.',
      'Connected to Tessa and Tessa Blocks as specific learning tools.',
    ],
    metrics: [
      { label: 'Pilot duration', value: '5 months' },
      { label: 'Learners reached', value: '40 Grade 5 students' },
      { label: 'Program partner', value: 'Stanbic Bank Zambia' },
    ],
    sourceLinks: [
      {
        label: 'Robotix Institute: A Year of Innovation & Impact',
        href: 'https://www.robotixinstitute.io/blog/robotix-institute-a-year-of-innovation-impact',
      },
      {
        label: 'Stanbic Bank Zambia Wins Best Tech-Driven CSR Initiative Award for STEAM Education Program',
        href: 'https://www.robotixinstitute.io/blog/stanbic-bank-zambia-csr-award-robotix-institute',
      },
      {
        label: 'Community Based Initiatives',
        href: 'https://www.robotixinstitute.io/service/community-iniiatives',
      },
      {
        label: 'Robotix after-school robotics article',
        href: 'https://www.robotixinstitute.io/blog/robotics-after-school-program',
      },
    ],
  },
] as const;

export const schoolSpotlightStories: SchoolStory[] = [
  {
    slug: 'american-international-school-lusaka-spotlight',
    kind: 'spotlight',
    name: 'American International School of Lusaka',
    short: 'AISL',
    status: 'International school spotlight',
    period: 'Current school profile, reviewed May 18, 2026',
    location: 'Leopards Hill Road, Lusaka, Zambia',
    imageSrc:
      'https://resources.finalsite.net/images/f_auto,q_auto/v1738041978/aislusakaorg/jnt6yzajwnhx8fdyscy3/Jacarandaphoto.jpg',
    imageAlt: 'American International School of Lusaka campus image.',
    imageCaption:
      'AISL presents itself as a world-class international school community with strong academics, co-curricular opportunities, and family engagement.',
    logoSrc:
      'https://resources.finalsite.net/images/f_auto,q_auto/v1709790451/aislusakaorg/gmksdmwbadfkmkkt86cx/AISLLogo000000.png',
    logoAlt: 'American International School of Lusaka logo.',
    summary:
      'AISL is a well-resourced Lusaka international school with a strong co-curricular culture, making it the kind of school community where families often look for serious robotics and coding enrichment outside the normal day.',
    highlight:
      'Robotix does not currently have a public case-study post naming AISL directly in the way it does for French International School and Northmead, so this is presented as a parent-facing school spotlight rather than a confirmed public partnership case study.',
    lead:
      'AISL is included here because parents comparing top international-school experiences in Lusaka often want to know whether Robotix feels like a strong fit for children in rigorous, future-focused learning environments.',
    content: [
      'According to AISL\'s official site, the school serves children from ages 3 to 18 and combines an international curriculum with a strong co-curricular culture. Its published profile highlights more than 60 extracurricular opportunities, more than 40 parent workshops annually, and a 1:1 laptop and iPad environment. That tells us AISL families are already used to rich, high-expectation learning ecosystems.',
      'That is exactly where Robotix\'s public message becomes useful for parents. Robotix says it offers programs at all leading international schools in Zambia, and its after-school robotics article describes a hands-on model built around creativity, teamwork, confidence, and problem-solving. For families in a school environment like AISL, that kind of enrichment feels like a natural extension of what students already experience during the school week.',
      'Just as importantly, Robotix\'s public contact page lists open hours as Saturday to Wednesday, 10AM to 7PM. That gives busy families a practical signal that the program is not only school-facing. It can also work as a weekend and after-school pathway for children who need a structured but exciting place to build, code, and explore beyond the classroom.',
    ],
    evidence: [
      'AISL official site says it serves children ages 3 to 18 and has more than 60 extracurricular opportunities.',
      'AISL\'s CCAs page describes an after-school program designed to build positive characteristics through co-curricular participation.',
      'Robotix says it serves leading international schools in Zambia and publicly promotes after-school robotics classes.',
    ],
    metrics: [
      { label: 'Extra-curriculars', value: '60+' },
      { label: 'Parent workshops', value: '40+' },
      { label: 'Tech environment', value: '1:1 laptop / iPad' },
    ],
    sourceLinks: [
      {
        label: 'AISL About Us',
        href: 'https://www.aislusaka.org/about-us',
      },
      {
        label: 'AISL CCAs',
        href: 'https://www.aislusaka.org/student-life/ccas',
      },
      {
        label: 'Robotix Institute homepage',
        href: 'https://www.robotixinstitute.io/',
      },
      {
        label: 'Robotix after-school robotics article',
        href: 'https://www.robotixinstitute.io/blog/robotics-after-school-program',
      },
      {
        label: 'Robotix contact page',
        href: 'https://www.robotixinstitute.io/contact',
      },
    ],
  },
  {
    slug: 'international-school-of-lusaka-spotlight',
    kind: 'spotlight',
    name: 'International School of Lusaka',
    short: 'ISL',
    status: 'International school spotlight',
    period: 'Current school profile, reviewed May 18, 2026',
    location: 'Nangwenya Road, Lusaka, Zambia',
    imageSrc:
      'https://static.wixstatic.com/media/7e2a23_3ddad44fb4e04c8d80b0f6e1cad655da~mv2.jpg',
    imageAlt: 'International School of Lusaka campus image.',
    imageCaption:
      'ISL presents itself as a large, diverse international school with strong extracurricular life and a broad educational philosophy.',
    logoSrc:
      'https://static.wixstatic.com/media/6227d1_fa5430fc62ee4970a6b9e94b1196f024~mv2.png/v1/fill/w_250,h_250,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Logo%20(transparent)1.png',
    logoAlt: 'International School of Lusaka logo.',
    summary:
      'ISL is one of Lusaka\'s best-known international schools, and its emphasis on inquiry, creativity, and extracurricular growth makes it a strong parent-facing school spotlight for Robotix\'s weekend and after-school positioning.',
    highlight:
      'Robotix does not currently have a public case-study post naming ISL directly in the same explicit way as French International School and Northmead, so this profile is framed as a parent-facing school spotlight rather than a confirmed public partnership case study.',
    lead:
      'ISL belongs on this page because it helps parents picture the kind of globally minded school environment where a hands-on robotics and coding program like Robotix can feel especially valuable.',
    content: [
      'ISL\'s official pages describe a large and diverse school community with close to 700 students, more than 60 nationalities, and a philosophy built around inquiry, creativity, action, and reflection. That matters for parents because it paints a picture of children who are already learning in an environment that values curiosity, independent thinking, and broad development.',
      'ISL\'s School Life and Middle School pages also talk about extracurricular activities as a place where students learn new skills, broaden their experiences, and build participation-based confidence. That aligns closely with Robotix\'s public after-school story, which describes robotics classes as a playful but purposeful space where students experiment, solve problems, and discover what they enjoy.',
      'For parents, the practical appeal is strong as well. Robotix publicly lists Saturday to Wednesday, 10AM to 7PM as its opening hours. Combined with its after-school robotics messaging, that makes weekend and flexible learning a big part of the value proposition for families who want their children to keep building future-ready skills outside the school timetable.',
    ],
    evidence: [
      'ISL official pages describe close to 700 students and more than 60 nationalities.',
      'ISL highlights extracurricular activities as a space for skill-building, participation, and broader experiences.',
      'Robotix publicly promotes after-school robotics classes and weekend-accessible operating hours.',
    ],
    metrics: [
      { label: 'Students', value: '700 approx.' },
      { label: 'Nationalities', value: '60+' },
      { label: 'School focus', value: 'Inquiry + creativity' },
    ],
    sourceLinks: [
      {
        label: 'ISL About Us',
        href: 'https://www.isl.sch.zm/about-us',
      },
      {
        label: 'ISL School Life',
        href: 'https://www.isl.sch.zm/school-life',
      },
      {
        label: 'ISL Home page',
        href: 'https://www.isl.sch.zm/',
      },
      {
        label: 'Robotix Institute homepage',
        href: 'https://www.robotixinstitute.io/',
      },
      {
        label: 'Robotix after-school robotics article',
        href: 'https://www.robotixinstitute.io/blog/robotics-after-school-program',
      },
      {
        label: 'Robotix contact page',
        href: 'https://www.robotixinstitute.io/contact',
      },
    ],
  },
] as const;

export const schoolReferenceStories: SchoolStory[] = [
  {
    slug: 'lics-smart-house-reference',
    kind: 'note',
    name: 'LICS smart house reference',
    short: 'LICS',
    status: 'Publicly referenced school acronym',
    period: 'February 18, 2025',
    location: 'Zambia',
    imageSrc: robotixProfile.officialMedia[2].src,
    imageAlt: 'Close-up of a learner robotics build in progress.',
    imageCaption:
      'Robotix publicly referenced a Smart House Challenge at LICS in its 2025 impact recap.',
    summary:
      'Robotix\'s February 18, 2025 impact recap says learners took part in a Smart House Challenge at "LICS." The post uses the acronym only, so this page keeps the wording exactly as publicly published.',
    highlight:
      'This is useful as a public signal of another school-linked activity, but it is not as explicit as the fully named school partnerships.',
    lead:
      'The LICS reference belongs on the page because it appears in Robotix\'s own public timeline, but it should be handled carefully because the source uses only an acronym.',
    content: [
      'In its 2025 impact recap, Robotix says it pushed creativity through a Smart House Challenge at LICS, where students designed homes with sensors and security features. That sentence adds another school-linked moment to Robotix\'s public story.',
      'At the same time, the source does not spell out the school name in full. Because of that, the safest presentation is to preserve the original wording and label the item as a public reference rather than a fully confirmed school profile.',
      'This internal summary keeps the context accessible on the Robotix site without sending visitors away, while still staying honest about the certainty level of the underlying source.',
    ],
    evidence: [
      'Appears in Robotix\'s February 18, 2025 impact recap.',
      'Described as a Smart House Challenge with sensors and security features.',
      'Source uses only the acronym "LICS".',
    ],
    metrics: [
      { label: 'Source type', value: 'Impact recap mention' },
      { label: 'Certainty level', value: 'Acronym only' },
      { label: 'Theme', value: 'Creative smart-home design' },
    ],
    sourceLinks: [
      {
        label: 'Robotix Institute: A Year of Innovation & Impact',
        href: 'https://www.robotixinstitute.io/blog/robotix-institute-a-year-of-innovation-impact',
      },
    ],
  },
  {
    slug: 'public-school-expansion-note',
    kind: 'note',
    name: 'Public school expansion note',
    short: 'EXP',
    status: 'Community initiatives reference',
    period: 'Publicly visible on the community initiatives page',
    location: 'Zambia',
    imageSrc: robotixProfile.officialMedia[3].src,
    imageAlt: 'Hands-on robotics assembly by a Robotix learner.',
    imageCaption:
      'Robotix says the Northmead pilot was part of a broader effort to expand digital technology access in schools.',
    summary:
      'The Robotix Community Based Initiatives page says the Northmead pilot was part of a broader effort with Stanbic Bank Zambia to introduce digital technologies into the public school system and expand to more schools.',
    highlight:
      'This matters because it shows Robotix presenting school work not as a one-off story, but as part of a wider access strategy.',
    lead:
      'The public school expansion note is less about one named school and more about the direction of Robotix\'s school partnership work.',
    content: [
      'On the Community Based Initiatives page, Robotix says it partnered with Stanbic Bank to introduce digital technologies in the public school system, with a pilot running at Northmead Primary School and plans to expand to more schools.',
      'That statement is important because it turns the Northmead story into a model for future delivery. It suggests Robotix wants to be seen as a practical implementation partner for school-based technology access, especially where inclusion and underserved learners are part of the goal.',
      'For the website, this note helps connect the individual school cards to a larger narrative: Robotix is not only teaching classes, it is also building a school-partnership pathway that can scale.',
    ],
    evidence: [
      'Published on Robotix\'s service page for community initiatives.',
      'Directly connects Northmead to public-school system work.',
      'Mentions plans to expand to more schools.',
    ],
    metrics: [
      { label: 'Program frame', value: 'Community access' },
      { label: 'Expansion signal', value: 'More schools planned' },
      { label: 'Partner named', value: 'Stanbic Bank Zambia' },
    ],
    sourceLinks: [
      {
        label: 'Community Based Initiatives',
        href: 'https://www.robotixinstitute.io/service/community-iniiatives',
      },
    ],
  },
] as const;

export const allSchoolStories = [
  ...featuredSchoolStories,
  ...schoolSpotlightStories,
  ...schoolReferenceStories,
] as const;

export function getSchoolStory(slug: string) {
  return allSchoolStories.find((story) => story.slug === slug);
}
