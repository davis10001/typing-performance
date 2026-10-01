export type TestPageConfig = {
  slug: string;
  durationSeconds: 60 | 180 | 300;
  title: string;
  description: string;
  intro: string;
  guidance: string;
  faq: { question: string; answer: string }[];
};

export const testPages = {
  "typing-test": {
    slug: "typing-test",
    durationSeconds: 60,
    title: "Typing Test",
    description: "Test your typing speed in one, three, or five minutes. See WPM, accuracy, and a clear explanation of your result.",
    intro: "A straightforward typing test that starts without an account. Choose a duration, type the passage, and see how you did.",
    guidance: "Start with one minute for a quick check. Choose three or five minutes when you want a longer look at your pace and accuracy.",
    faq: [
      { question: "What does this typing test measure?", answer: "It reports correct words per minute, raw words per minute, accuracy, and mistakes. A word is counted as five characters for speed calculations." },
      { question: "Do I need an account?", answer: "No. You can take the test anonymously, and recent completed results stay in this browser." },
    ],
  },
  "1-minute-typing-test": {
    slug: "1-minute-typing-test",
    durationSeconds: 60,
    title: "1 Minute Typing Test",
    description: "Take a quick one-minute typing test. Get your WPM, accuracy, and an easy way to retest.",
    intro: "One minute is enough for a quick check of your current pace. It is easy to repeat when you want to compare attempts.",
    guidance: "Use the same duration for repeat attempts. A short test can vary from one attempt to the next, so look at more than a single result.",
    faq: [
      { question: "Is a one-minute result reliable?", answer: "It is useful for a quick check, but a single short attempt can vary. Try a longer test for a steadier view of your pace." },
      { question: "Can I retake the test?", answer: "Yes. Your next attempt starts a fresh session, and completed attempts can be viewed in this browser." },
    ],
  },
  "3-minute-typing-test": {
    slug: "3-minute-typing-test",
    durationSeconds: 180,
    title: "3 Minute Typing Test",
    description: "Measure your typing pace over three minutes with WPM, accuracy, mistakes, and a simple result summary.",
    intro: "Three minutes gives you time to settle into a rhythm while keeping the test manageable. It is a useful middle ground for repeat practice.",
    guidance: "Aim for consistent typing rather than a fast opening burst. The final result uses your full elapsed test time.",
    faq: [
      { question: "Why choose three minutes?", answer: "It gives you a longer sample than a quick test without taking much time. Compare it with other three-minute attempts for a fairer view." },
      { question: "What happens when time runs out?", answer: "Typing stops automatically and your result shows speed, accuracy, and mistakes from that attempt." },
    ],
  },
  "5-minute-typing-test": {
    slug: "5-minute-typing-test",
    durationSeconds: 300,
    title: "5 Minute Typing Test",
    description: "Try a five-minute typing test to see how your speed and accuracy hold up over a longer session.",
    intro: "A longer session shows whether your pace stays steady. Use this test when you want more than a quick snapshot.",
    guidance: "Stay comfortable and keep an even rhythm. The final score reflects the full five-minute attempt, including corrections and pauses.",
    faq: [
      { question: "How is a five-minute test different?", answer: "It samples a longer period, so the result captures changes in pace and accuracy that a short test may miss." },
      { question: "Can I stop early?", answer: "Yes. Ending early abandons the attempt and does not create a completed result." },
    ],
  },
} satisfies Record<string, TestPageConfig>;

export type TestPageSlug = keyof typeof testPages;

export const durationOptions = [
  { seconds: 60, label: "1 MIN", href: "/1-minute-typing-test" },
  { seconds: 180, label: "3 MIN", href: "/3-minute-typing-test" },
  { seconds: 300, label: "5 MIN", href: "/5-minute-typing-test" },
] as const;
