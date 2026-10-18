export type ParagraphLevel = "beginner" | "intermediate" | "advanced";
export type ParagraphFocus = "everyday" | "work-study" | "punctuation" | "story" | "numbers-symbols" | "endurance";

export type PracticeParagraph = {
  id: string;
  title: string;
  text: string;
  setId: string;
  order: number;
  level: ParagraphLevel;
  focus: ParagraphFocus;
  locale: "en-US";
  wordCount: number;
  characterCount: number;
};

export type ParagraphSet = {
  id: string;
  title: string;
  description: string;
  level: ParagraphLevel;
  focus: ParagraphFocus;
  estimatedMinutes: number;
  paragraphs: readonly PracticeParagraph[];
};

export const PARAGRAPH_CONTENT_REVISION = "paragraphs-2026-10-17-v1";

type ParagraphSource = Omit<PracticeParagraph, "wordCount" | "characterCount" | "locale">;

function paragraph(source: ParagraphSource): PracticeParagraph {
  return {
    ...source,
    locale: "en-US",
    wordCount: source.text.trim().split(/\s+/).length,
    characterCount: [...source.text].length,
  };
}

function set(
  details: Omit<ParagraphSet, "paragraphs">,
  passages: readonly Omit<ParagraphSource, "setId" | "level" | "focus" | "order">[],
): ParagraphSet {
  return {
    ...details,
    paragraphs: passages.map((passage, index) => paragraph({
      ...passage,
      setId: details.id,
      level: details.level,
      focus: details.focus,
      order: index,
    })),
  };
}

export const paragraphSets: readonly ParagraphSet[] = [
  set({
    id: "everyday-english",
    title: "Everyday English",
    description: "Build a steady rhythm with familiar situations, common words, capitals, commas, and periods.",
    level: "beginner",
    focus: "everyday",
    estimatedMinutes: 4,
  }, [
    {
      id: "everyday-morning",
      title: "A Clear Morning",
      text: "A clear morning gives the city a different rhythm. Store owners lift their gates, buses begin their routes, and neighbors carry coffee toward the train. The sidewalks are still quiet enough to hear birds above the traffic. By eight o'clock, the streets feel busy again, but the calm start makes the whole day seem easier.",
    },
    {
      id: "everyday-market",
      title: "Saturday Market",
      text: "The farmers market opens early on Saturday. Families walk between tables filled with bread, fruit, flowers, and jars of honey. A musician plays near the entrance while shoppers compare tomatoes and peaches. Before leaving, many people stop for breakfast and talk with friends they did not expect to see.",
    },
    {
      id: "everyday-walk",
      title: "The Evening Walk",
      text: "After dinner, Maya takes a short walk around her neighborhood. She passes a small park, a library, and a row of houses with bright porch lights. The walk gives her time to think about the day and plan tomorrow. When she returns home, she feels calmer and ready to read before bed.",
    },
  ]),
  set({
    id: "work-and-study",
    title: "Work & Study",
    description: "Practice practical vocabulary from schedules, projects, messages, and focused study sessions.",
    level: "beginner",
    focus: "work-study",
    estimatedMinutes: 5,
  }, [
    {
      id: "work-daily-plan",
      title: "A Simple Plan",
      text: "Jordan starts each workday with a simple plan. First, he checks his calendar and answers urgent messages. Next, he chooses one important task and works on it without opening other tabs. He takes a short break before lunch, reviews his progress in the afternoon, and writes tomorrow's first step before going home.",
    },
    {
      id: "study-library",
      title: "A Quiet Study Hour",
      text: "Nina reserves one quiet hour at the library after class. She puts her phone in her bag, opens her notes, and writes down the questions she still needs to answer. When a topic feels difficult, she explains it in plain language. This habit helps her notice what she understands and what needs another review.",
    },
    {
      id: "work-team-update",
      title: "The Team Update",
      text: "A useful team update is brief and specific. It explains what was finished, what is happening next, and where help is needed. Clear dates make the plan easier to follow. When everyone shares the same facts, the meeting can focus on decisions instead of repeating information that people already know.",
    },
  ]),
  set({
    id: "capitals-and-punctuation",
    title: "Capitals & Punctuation",
    description: "Train Shift, apostrophes, questions, quotations, commas, and names in complete sentences.",
    level: "intermediate",
    focus: "punctuation",
    estimatedMinutes: 6,
  }, [
    {
      id: "punctuation-travel-note",
      title: "A Note from Chicago",
      text: "On Tuesday, Elena sent a note from Chicago: “The lake is brighter than I expected, and the wind hasn't stopped all day.” She planned to visit the Art Institute in the morning, meet Carlos for lunch, and take an evening train to Milwaukee. “Will you be home on Friday?” she asked. Her message ended with a promise to bring back photographs.",
    },
    {
      id: "punctuation-community-meeting",
      title: "The Community Meeting",
      text: "At the community meeting, Mr. Harris asked, “Which project should we begin first?” Some neighbors wanted new trees along Oak Street; others preferred better lighting near the station. After twenty minutes of discussion, the group reached a practical compromise: plant the trees in April, review the lighting proposal in May, and publish both budgets online.",
    },
    {
      id: "punctuation-museum",
      title: "An Unexpected Exhibit",
      text: "The museum's newest exhibit was called “Small Objects, Big Stories.” It included a pilot's worn map, a child's red notebook, and a chef's first handwritten menu. Each object seemed ordinary at first; however, the labels explained where it had traveled and why someone had saved it. By the final room, visitors were asking, “What everyday object would tell our story?”",
    },
  ]),
  set({
    id: "story-practice",
    title: "Story Practice",
    description: "Follow a narrative across longer sentences while maintaining an even, accurate pace.",
    level: "intermediate",
    focus: "story",
    estimatedMinutes: 6,
  }, [
    {
      id: "story-lost-key",
      title: "The Lost Key",
      text: "When Theo reached his apartment, the key was missing from his pocket. He checked his backpack twice, then slowly retraced the walk from the bus stop. Near the corner bakery, he noticed something silver beside a rain puddle. The key had landed under the edge of a newspaper, where a delivery driver had placed it to keep it from washing into the street.",
    },
    {
      id: "story-rooftop-garden",
      title: "The Rooftop Garden",
      text: "The garden began with three wooden boxes on an empty roof. By midsummer, vines curled around the railings, bees moved between yellow flowers, and tomatoes warmed in the sun. People from every floor started visiting after work. Some watered the plants, while others brought chairs and shared stories. The roof became the one place where the whole building felt like a neighborhood.",
    },
    {
      id: "story-last-bus",
      title: "The Last Bus",
      text: "Rain covered the station windows when the final bus arrived. Sam climbed aboard, found a seat near the back, and watched the driver wait for one last passenger running across the square. The doors opened just in time. Everyone was tired, yet the small act changed the mood inside the bus. A few people smiled, and someone quietly said, “Good catch.”",
    },
  ]),
  set({
    id: "numbers-and-symbols",
    title: "Numbers & Symbols",
    description: "Practice dates, times, prices, percentages, email addresses, and symbols inside realistic text.",
    level: "advanced",
    focus: "numbers-symbols",
    estimatedMinutes: 7,
  }, [
    {
      id: "numbers-event-plan",
      title: "Event Details",
      text: "The workshop begins on October 24, 2026, at 9:30 a.m. Doors open at 8:45, and check-in closes at 9:20. General admission costs $48.00, while students receive a 25% discount with valid identification. Questions can be sent to events@example.com before 5:00 p.m. on October 20. The venue has 120 seats, so early registration is recommended.",
    },
    {
      id: "numbers-monthly-budget",
      title: "Monthly Budget",
      text: "The project budget is $12,500. Materials account for $4,275, design work costs $3,100, and testing is limited to $2,625. The remaining $2,500 covers delivery and a 10% reserve. If material prices rise by more than 5%, the team must email finance@example.com and request approval before placing the order. Every receipt should include the project code: TP-2026-04.",
    },
    {
      id: "numbers-travel-schedule",
      title: "Travel Schedule",
      text: "Flight 417 leaves Denver at 6:35 a.m. and arrives in Seattle at 8:42 a.m. local time. The hotel shuttle departs every 30 minutes from Door 3; a one-way ticket costs $18.50. Check-in begins at 3:00 p.m., but bags may be stored earlier. For schedule changes, call +1 (555) 014-2076 or visit travel.example.com/update within 24 hours of departure.",
    },
  ]),
  set({
    id: "long-paragraphs",
    title: "Long Paragraphs",
    description: "Maintain accuracy and rhythm through longer passages with varied sentences and punctuation.",
    level: "advanced",
    focus: "endurance",
    estimatedMinutes: 9,
  }, [
    {
      id: "endurance-public-library",
      title: "A Library Changes with Its City",
      text: "A public library may look quiet from the sidewalk, but its work changes whenever the surrounding city changes. In the morning, parents bring young children to story time while job seekers use computers to prepare applications. During the afternoon, students gather around shared tables, and older residents ask for help finding reliable health information. Evening programs might include language classes, tax assistance, local history talks, or a meeting for a neighborhood organization. The books still matter, of course, but the building also provides something harder to measure: a safe place where people can learn without being expected to buy anything. When library staff plan new services, they listen to visitors, study which resources are used, and adjust the schedule. A strong library keeps its purpose while finding new ways to serve the people who walk through its doors.",
    },
    {
      id: "endurance-small-habits",
      title: "The Value of Small Habits",
      text: "Large goals often receive the most attention, yet daily habits usually decide whether those goals become real. A person who wants to read more does not need to finish a book every weekend; reading ten pages before bed can create steady progress. Someone learning a language might review vocabulary for fifteen minutes each morning instead of waiting for a free afternoon that rarely appears. Small habits work because they reduce the effort required to begin. They also create useful evidence: after several weeks, the learner can see what has improved and where the routine breaks down. The habit should be clear enough to repeat, flexible enough to survive a busy day, and connected to a reason that matters. Progress may feel slow at first, but consistent practice gives skill a chance to grow without depending on perfect motivation.",
    },
    {
      id: "endurance-city-trees",
      title: "Why Cities Plant Trees",
      text: "City trees do more than make a street attractive. Their leaves create shade on hot sidewalks, their roots help absorb rain, and their branches provide shelter for birds and insects. A healthy tree can also make a walk to school or a wait at a bus stop more comfortable. Planting one, however, is only the beginning. Young trees need water, protection from damage, and enough soil for their roots to expand. City planners must choose species that can handle local weather without interfering with power lines, pavement, or underground pipes. They also need to distribute trees fairly, because some neighborhoods have far less shade than others. The best programs combine long-term maintenance with public information, giving residents a way to report damage and participate in care. With patient planning, a row of small trees can become useful public infrastructure for decades.",
    },
  ]),
] as const;

export function getParagraphSet(setId: string): ParagraphSet | undefined {
  return paragraphSets.find((item) => item.id === setId);
}

export function getParagraph(paragraphId: string): PracticeParagraph | undefined {
  return paragraphSets.flatMap((item) => item.paragraphs).find((item) => item.id === paragraphId);
}
