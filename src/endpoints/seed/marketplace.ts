import type { Payload, PayloadRequest } from 'payload'
import type { Media, Resource } from '@/payload-types'

// Build a minimal Lexical rich-text value from plain paragraphs.
const lexical = (paragraphs: string[]): Resource['content'] =>
  ({
    root: {
      type: 'root',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        children: [
          { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }) as unknown as Resource['content']

const SUBJECTS = [
  { slug: 'algebra', title: 'Algebra' },
  { slug: 'geometry', title: 'Geometry' },
  { slug: 'statistics', title: 'Statistics' },
  { slug: 'calculus', title: 'Calculus' },
  { slug: 'number', title: 'Number' },
  { slug: 'trigonometry', title: 'Trigonometry' },
]

// UK Key Stages (the mockup uses US grade labels — these are CMS-editable seed values)
const GRADES = [
  { slug: 'ks1', title: 'Key Stage 1', band: 'Primary', order: 1 },
  { slug: 'ks2', title: 'Key Stage 2', band: 'Primary', order: 2 },
  { slug: 'ks3', title: 'Key Stage 3', band: 'Secondary', order: 3 },
  { slug: 'gcse', title: 'GCSE', band: 'Secondary', order: 4 },
  { slug: 'a-level', title: 'A-Level', band: 'Post-16', order: 5 },
]

const TYPES = [
  { slug: 'worksheets', title: 'Worksheets', icon: 'fileText' as const, order: 1 },
  { slug: 'lesson-plans', title: 'Lesson Plans', icon: 'bookOpen' as const, order: 2 },
  { slug: 'assessments', title: 'Assessments', icon: 'clipboardCheck' as const, order: 3 },
  { slug: 'revision', title: 'Revision', icon: 'fileText' as const, order: 4 },
]

const AUTHORS = [
  {
    key: 'sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@mathed.example.com',
    headline: 'M.Ed.',
    bio: 'Top educator • 15+ years experience',
  },
  {
    key: 'david',
    name: 'David Chen',
    email: 'david.chen@mathed.example.com',
    headline: 'Head of Maths',
    bio: 'GCSE specialist • 10+ years experience',
  },
  {
    key: 'elena',
    name: 'Dr. Elena Rodriguez',
    email: 'elena.rodriguez@mathed.example.com',
    headline: 'PhD',
    bio: 'Statistics & data educator',
  },
  {
    key: 'mark',
    name: 'Mark Stevens',
    email: 'mark.stevens@mathed.example.com',
    headline: 'A-Level Tutor',
    bio: 'Calculus & mechanics enthusiast',
  },
]

const REVIEWERS = [
  {
    key: 'marcus',
    name: 'Marcus Donnelly',
    email: 'marcus.d@school.example.com',
    headline: '8th Grade Teacher',
  },
  {
    key: 'linda',
    name: 'Linda Spencer',
    email: 'linda.s@school.example.com',
    headline: 'Math Specialist',
  },
  {
    key: 'priya',
    name: 'Priya Anand',
    email: 'priya.a@school.example.com',
    headline: 'Head of Department',
  },
]

type ResourceSpec = {
  slug: string
  title: string
  subject: string
  grades: string[]
  type: string
  price: number
  verified?: boolean
  author: string
  highlights: string[]
  objectives: string[]
  description: string[]
  reviews: { reviewer: string; rating: number; body: string }[]
}

const RESOURCES: ResourceSpec[] = [
  {
    slug: 'complete-algebra-i-workbook',
    title: 'Complete Algebra I Workbook',
    subject: 'algebra',
    grades: ['gcse', 'ks3'],
    type: 'worksheets',
    price: 24.99,
    verified: true,
    author: 'sarah',
    highlights: [
      '150+ Worksheets and Practice Sets',
      'Full Answer Key & Video Solutions',
      '8 Unit Assessments (Aligned to curriculum)',
      'Lifetime Updates Included',
    ],
    objectives: [
      'Construct and solve linear equations and inequalities in one variable.',
      'Master factoring techniques for quadratic trinomials and special cases.',
      'Interpret and graph functions, including domain, range, and transformations.',
      'Analyze and model real-world scenarios using systems of equations.',
    ],
    description: [
      'Empower your students to master Algebra I with this comprehensive workbook designed by a veteran maths educator. This resource bridges the gap between conceptual understanding and procedural fluency, providing a structured pathway through the most challenging topics of the curriculum.',
      'From simplifying radical expressions to mastering the quadratic formula, each lesson is designed with the classroom environment in mind. The pages are clean, free of unnecessary distractions, and feature plenty of space for students to show their work.',
    ],
    reviews: [
      {
        reviewer: 'marcus',
        rating: 5,
        body: 'This workbook has been a lifesaver for my Algebra sections. The scaffolding is perfect—moving from simple computation to complex application without losing the students. My class particularly enjoyed the visual graph explorations.',
      },
      {
        reviewer: 'linda',
        rating: 5,
        body: 'Very rigorous content. It is rare to find a resource that truly aligns with common core standards while remaining accessible to students with different learning speeds. The answer key is remarkably error-free.',
      },
    ],
  },
  {
    slug: 'quadratic-functions-mastery',
    title: 'Quadratic Functions Mastery Pack',
    subject: 'algebra',
    grades: ['gcse'],
    type: 'worksheets',
    price: 12.5,
    verified: true,
    author: 'sarah',
    highlights: ['40 graded worksheets', 'Worked examples', 'Exam-style questions'],
    objectives: [
      'Complete the square to find turning points.',
      'Sketch quadratic graphs from factored and standard form.',
      'Solve quadratics using multiple methods.',
    ],
    description: [
      'A focused pack on quadratic functions, taking students from the basics of factorising through to completing the square and graphing parabolas with confidence.',
    ],
    reviews: [
      {
        reviewer: 'marcus',
        rating: 5,
        body: 'Exactly the practice my students needed before the exam.',
      },
    ],
  },
  {
    slug: 'interactive-geometry-toolkit',
    title: 'Interactive Geometry Toolkit',
    subject: 'geometry',
    grades: ['ks3'],
    type: 'lesson-plans',
    price: 8.0,
    author: 'david',
    highlights: ['12 ready-to-teach lessons', 'Printable nets & templates', 'Starter activities'],
    objectives: [
      'Identify properties of 2D and 3D shapes.',
      'Calculate angles in parallel lines and polygons.',
      'Construct accurate diagrams using a compass and protractor.',
    ],
    description: [
      'A complete set of interactive geometry lessons that get students measuring, constructing and reasoning about shapes. Each lesson includes a starter, main activity and plenary.',
    ],
    reviews: [
      {
        reviewer: 'priya',
        rating: 4,
        body: 'Great lesson structure, my department adopted these immediately.',
      },
    ],
  },
  {
    slug: 'statistical-inference-essentials',
    title: 'Statistical Inference Essentials',
    subject: 'statistics',
    grades: ['a-level'],
    type: 'lesson-plans',
    price: 0,
    verified: true,
    author: 'elena',
    highlights: ['Hypothesis testing walkthroughs', 'Real datasets', 'Free sample lesson'],
    objectives: [
      'Formulate null and alternative hypotheses.',
      'Carry out and interpret significance tests.',
      'Communicate statistical conclusions in context.',
    ],
    description: [
      'A free introduction to statistical inference for A-Level students, covering hypothesis testing with real-world datasets and clear, step-by-step worked examples.',
    ],
    reviews: [
      {
        reviewer: 'linda',
        rating: 5,
        body: 'Incredible that this is free. Genuinely classroom-ready.',
      },
    ],
  },
  {
    slug: 'calculus-limits-and-continuity',
    title: 'Calculus: Limits and Continuity',
    subject: 'calculus',
    grades: ['a-level'],
    type: 'worksheets',
    price: 15.0,
    verified: true,
    author: 'mark',
    highlights: [
      'Concept-building worksheets',
      'Graphical & algebraic approaches',
      'Full solutions',
    ],
    objectives: [
      'Evaluate limits algebraically and graphically.',
      'Determine continuity at a point and on an interval.',
      'Apply limit laws to rational functions.',
    ],
    description: [
      'Introduce limits and continuity with a carefully sequenced set of worksheets that build intuition before formal definitions. Ideal for the start of an A-Level calculus unit.',
    ],
    reviews: [
      {
        reviewer: 'priya',
        rating: 5,
        body: 'The progression from intuition to rigour is beautifully done.',
      },
    ],
  },
  {
    slug: 'area-and-volume-project',
    title: 'Area & Volume Project',
    subject: 'geometry',
    grades: ['ks3', 'ks2'],
    type: 'assessments',
    price: 5.99,
    author: 'david',
    highlights: ['Real-world project brief', 'Marking rubric included', 'Cross-curricular links'],
    objectives: [
      'Calculate area, surface area and volume of composite shapes.',
      'Apply measurement skills to a real design task.',
    ],
    description: [
      'A project-based assessment where students design a package or structure, applying their knowledge of area and volume. Includes a clear marking rubric.',
    ],
    reviews: [
      {
        reviewer: 'marcus',
        rating: 4,
        body: 'My students were genuinely engaged with the design brief.',
      },
    ],
  },
  {
    slug: 'linear-equations-real-world',
    title: 'Linear Equations in the Real World',
    subject: 'algebra',
    grades: ['gcse', 'ks3'],
    type: 'worksheets',
    price: 10.0,
    verified: true,
    author: 'sarah',
    highlights: ['Context-rich problems', 'Differentiated tiers', 'Answer key'],
    objectives: [
      'Model real situations with linear equations.',
      'Solve and interpret solutions in context.',
    ],
    description: [
      'Bring linear equations to life with problems rooted in real-world contexts, from mobile phone tariffs to taxi fares. Three differentiated tiers included.',
    ],
    reviews: [
      {
        reviewer: 'linda',
        rating: 5,
        body: 'The contexts are relatable and the differentiation is spot on.',
      },
    ],
  },
  {
    slug: 'trigonometry-foundations',
    title: 'Trigonometry Foundations',
    subject: 'trigonometry',
    grades: ['gcse'],
    type: 'worksheets',
    price: 9.5,
    author: 'david',
    highlights: ['SOHCAHTOA practice', 'Exam questions', 'Answer key'],
    objectives: [
      'Use trigonometric ratios in right-angled triangles.',
      'Solve problems involving angles of elevation and depression.',
    ],
    description: [
      'A solid foundation in right-angled trigonometry, with plenty of graduated practice and exam-style questions to build confidence.',
    ],
    reviews: [{ reviewer: 'priya', rating: 4, body: 'Clear and well-sequenced practice.' }],
  },
  {
    slug: 'probability-revision-cards',
    title: 'Probability Revision Cards',
    subject: 'statistics',
    grades: ['gcse'],
    type: 'revision',
    price: 6.0,
    author: 'elena',
    highlights: ['Printable flashcards', 'Tree & Venn diagrams', 'Quick-fire questions'],
    objectives: ['Calculate probabilities using diagrams.', 'Apply the AND/OR rules confidently.'],
    description: [
      'Compact, printable revision cards covering all the key probability skills students need for their GCSE, including tree and Venn diagram techniques.',
    ],
    reviews: [
      { reviewer: 'marcus', rating: 5, body: 'Perfect for last-minute revision sessions.' },
    ],
  },
  {
    slug: 'number-bonds-starter-pack',
    title: 'Number Bonds Starter Pack',
    subject: 'number',
    grades: ['ks1', 'ks2'],
    type: 'worksheets',
    price: 0,
    author: 'sarah',
    highlights: ['Colourful worksheets', 'Low-prep activities', 'Free download'],
    objectives: [
      'Recall number bonds to 10 and 20.',
      'Use number bonds to add and subtract fluently.',
    ],
    description: [
      'A free, colourful set of number-bond worksheets and activities for early primary learners. Low-prep and ready to print.',
    ],
    reviews: [
      { reviewer: 'linda', rating: 5, body: 'Lovely bright resources my Year 1 class loved.' },
    ],
  },
  {
    slug: 'simultaneous-equations-deep-dive',
    title: 'Simultaneous Equations Deep Dive',
    subject: 'algebra',
    grades: ['gcse', 'a-level'],
    type: 'lesson-plans',
    price: 11.0,
    verified: true,
    author: 'mark',
    highlights: ['Elimination & substitution', 'Graphical solutions', 'Stretch tasks'],
    objectives: [
      'Solve linear simultaneous equations by multiple methods.',
      'Solve a linear and quadratic pair.',
    ],
    description: [
      'A thorough teaching sequence on simultaneous equations, covering elimination, substitution and graphical methods, with stretch tasks for the most able.',
    ],
    reviews: [
      { reviewer: 'priya', rating: 5, body: 'Comprehensive and well-paced. Highly recommended.' },
    ],
  },
  {
    slug: 'data-handling-investigation',
    title: 'Data Handling Investigation',
    subject: 'statistics',
    grades: ['ks3'],
    type: 'assessments',
    price: 7.25,
    author: 'elena',
    highlights: ['Open-ended investigation', 'Self-assessment checklist', 'Sample responses'],
    objectives: [
      'Collect, organise and represent data appropriately.',
      'Interpret averages and spread in context.',
    ],
    description: [
      'A rich data-handling investigation that lets students pose their own question, collect data and present findings. Includes a self-assessment checklist.',
    ],
    reviews: [
      {
        reviewer: 'marcus',
        rating: 4,
        body: 'A great way to assess the whole statistics topic at once.',
      },
    ],
  },
  {
    slug: 'circle-theorems-master-class',
    title: 'Circle Theorems Master Class',
    subject: 'geometry',
    grades: ['gcse', 'a-level'],
    type: 'revision',
    price: 13.0,
    verified: true,
    author: 'david',
    highlights: ['All theorems summarised', 'Proof walkthroughs', 'Exam practice'],
    objectives: [
      'State and apply the circle theorems.',
      'Construct geometric proofs using theorems.',
    ],
    description: [
      'Everything students need to master circle theorems, from clear summaries of each theorem to guided proofs and exam-style practice questions.',
    ],
    reviews: [{ reviewer: 'linda', rating: 5, body: 'The proof walkthroughs are exceptional.' }],
  },
  {
    slug: 'introduction-to-differentiation',
    title: 'Introduction to Differentiation',
    subject: 'calculus',
    grades: ['a-level'],
    type: 'lesson-plans',
    price: 14.5,
    author: 'mark',
    highlights: ['First principles', 'Rules of differentiation', 'Applications'],
    objectives: [
      'Differentiate from first principles.',
      'Apply the power, product and chain rules.',
      'Find gradients, tangents and stationary points.',
    ],
    description: [
      'A complete introduction to differentiation for A-Level, starting from first principles and building up to applications such as tangents and stationary points.',
    ],
    reviews: [
      { reviewer: 'priya', rating: 5, body: 'My go-to resource for introducing calculus.' },
    ],
  },
]

// Look up an existing doc by slug (or email), creating it only if missing — keeps the
// marketplace seed idempotent so it can be safely re-run.
const findOrCreate = async (
  payload: Payload,
  collection: 'subjects' | 'grades' | 'resource-types' | 'users',
  field: 'slug' | 'email',
  value: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): Promise<number> => {
  const existing = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    where: { [field]: { equals: value } },
  })
  if (existing.docs[0]) return existing.docs[0].id as number
  const created = await payload.create({ collection, data })
  return created.id as number
}

export const seedMarketplace = async ({
  payload,
  images,
}: {
  payload: Payload
  req?: PayloadRequest
  images: Media[]
}): Promise<void> => {
  payload.logger.info('— Seeding marketplace taxonomy...')

  const subjectBySlug = new Map<string, number>()
  for (const subject of SUBJECTS) {
    subjectBySlug.set(
      subject.slug,
      await findOrCreate(payload, 'subjects', 'slug', subject.slug, subject),
    )
  }

  const gradeBySlug = new Map<string, number>()
  for (const grade of GRADES) {
    gradeBySlug.set(grade.slug, await findOrCreate(payload, 'grades', 'slug', grade.slug, grade))
  }

  const typeBySlug = new Map<string, number>()
  for (const type of TYPES) {
    typeBySlug.set(
      type.slug,
      await findOrCreate(payload, 'resource-types', 'slug', type.slug, type),
    )
  }

  payload.logger.info('— Seeding marketplace authors & reviewers...')

  const userByKey = new Map<string, number>()
  for (const author of [...AUTHORS, ...REVIEWERS]) {
    userByKey.set(
      author.key,
      await findOrCreate(payload, 'users', 'email', author.email, {
        name: author.name,
        email: author.email,
        headline: author.headline,
        bio: (author as { bio?: string }).bio,
        roles: ['User'],
      }),
    )
  }

  payload.logger.info('— Seeding resources...')

  const resourceIdBySlug = new Map<string, number>()
  const createdResources: { spec: ResourceSpec; id: number }[] = []

  for (let i = 0; i < RESOURCES.length; i++) {
    const spec = RESOURCES[i]
    const heroImage = images[i % images.length]
    const existing = await payload.find({
      collection: 'resources',
      depth: 0,
      limit: 1,
      where: { slug: { equals: spec.slug } },
    })
    if (existing.docs[0]) {
      resourceIdBySlug.set(spec.slug, existing.docs[0].id as number)
      createdResources.push({ spec, id: existing.docs[0].id as number })
      continue
    }

    payload.logger.info(`— Creating resource "${spec.title}"...`)

    const doc = await payload.create({
      collection: 'resources',
      depth: 0,
      context: { disableRevalidate: true },
      data: {
        title: spec.title,
        slug: spec.slug,
        _status: 'published',
        heroImage: heroImage?.id,
        gallery: images.map((img) => img.id),
        price: spec.price,
        verified: spec.verified ?? false,
        subject: subjectBySlug.get(spec.subject),
        grades: spec.grades.map((g) => gradeBySlug.get(g)).filter((id): id is number => id != null),
        resourceType: typeBySlug.get(spec.type),
        atAGlance: spec.highlights.map((text) => ({ text })),
        learningObjectives: spec.objectives.map((text) => ({ text })),
        content: lexical(spec.description),
        authors: [userByKey.get(spec.author)].filter((id): id is number => id != null),
        publishedAt: new Date().toISOString(),
        meta: {
          title: spec.title,
          description: spec.description[0],
          image: heroImage?.id,
        },
      },
    })

    resourceIdBySlug.set(spec.slug, doc.id)
    createdResources.push({ spec, id: doc.id })
  }

  payload.logger.info('— Linking related resources...')

  for (let i = 0; i < createdResources.length; i++) {
    const { id } = createdResources[i]
    // Relate each resource to the next three (wrapping around)
    const related = [1, 2, 3]
      .map((offset) => createdResources[(i + offset) % createdResources.length].id)
      .filter((relatedId) => relatedId !== id)

    await payload.update({
      collection: 'resources',
      id,
      depth: 0,
      context: { disableRevalidate: true },
      data: { relatedResources: related },
    })
  }

  payload.logger.info('— Seeding reviews...')

  for (const { spec, id } of createdResources) {
    for (const review of spec.reviews) {
      const authorId = userByKey.get(review.reviewer)
      if (authorId == null) continue
      await payload.create({
        collection: 'reviews',
        data: {
          resource: id,
          author: authorId,
          rating: review.rating,
          body: review.body,
          verified: true,
        },
      })
    }
  }

  payload.logger.info('— Marketplace seed complete.')
}
