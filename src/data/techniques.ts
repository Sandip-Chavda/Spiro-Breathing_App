export interface Technique {
  id: string;
  name: string;
  tagline: string;
  imageUrl: string;
  goodFor: string[];
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  rounds: number;
  isPremium: boolean;
  intensity: "Gentle" | "Moderate" | "Advanced";
  benefits: string[];
  howTo: string[];
  precautions: string[];
  warnings: string[];
}

export const TECHNIQUES: Technique[] = [
  {
    id: "box-breathing",
    name: "Box Breathing",
    tagline: "4-4-4-4 · Steady focus",
    imageUrl:
      // "https://i.pinimg.com/1200x/0f/a7/5e/0fa75e8a99ba46132d54a04d8b4173c5.jpg",
      "https://i.pinimg.com/736x/50/68/f8/5068f811404badbf89dc4f12edeec584.jpg",
    goodFor: ["Stress Relief", "Focus", "Grounding"],
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    rounds: 20,
    isPremium: false,
    intensity: "Gentle",
    benefits: [
      "Improves focus and mental clarity",
      "Used by first responders and athletes to stay calm under pressure",
      "Balances the nervous system without straining the breath",
    ],
    howTo: [
      "Sit upright in a comfortable position",
      "Inhale slowly through your nose for 4 seconds",
      "Hold the breath gently for 4 seconds — no straining",
      "Exhale slowly through your mouth for 4 seconds",
      "Hold empty for 4 seconds, then repeat",
    ],
    precautions: [
      "Beginner-friendly — a good starting point if you're new to breathwork",
      "Stop and breathe normally if the holds ever feel uncomfortable",
    ],
    warnings: [
      "Do not practice while driving, operating machinery, or in water",
      "If you feel dizzy or lightheaded, stop and resume normal breathing immediately",
    ],
  },
  {
    id: "4-7-8-relaxing",
    name: "4-7-8 Relaxing",
    tagline: "4-7-8 · Wind down before sleep",
    imageUrl:
      "https://i.pinimg.com/736x/08/22/86/0822861a3163ab543703fcffdcb016e5.jpg",
    goodFor: ["Sleep", "Anxiety", "Racing Thoughts"],
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    rounds: 20,
    isPremium: false,
    intensity: "Moderate",
    benefits: [
      "Widely used to ease into sleep and reduce racing thoughts",
      "Activates the parasympathetic (rest-and-digest) nervous system",
    ],
    howTo: [
      "Sit or lie down in a relaxed position",
      "Inhale quietly through your nose for 4 seconds",
      "Hold the breath for 7 seconds",
      "Exhale completely through your mouth for 8 seconds, making a soft whoosh sound",
      "Repeat — but start with fewer rounds than you think you need",
    ],
    precautions: [
      "The 7-second hold is longer than Box Breathing — beginners may feel lightheaded on the first few rounds. This is common and usually passes as you adjust",
      "Start with 4 rounds and build up gradually rather than jumping to 20",
      "If you have low blood pressure, stand up slowly after practicing",
    ],
    warnings: [
      "Do not practice while driving, operating machinery, or in water",
      "Stop immediately if you feel dizzy, short of breath, or unwell",
      "If you are pregnant or have a heart, lung, or panic disorder, consult a doctor before trying breath-hold techniques",
    ],
  },
  {
    id: "coherent-breathing",
    name: "Coherent Breathing",
    tagline: "5-5 · Even, grounding",
    imageUrl:
      "https://i.pinimg.com/1200x/d4/45/b1/d445b173adbc57988c455d3b2042be56.jpg",
    goodFor: ["Daily Calm", "Beginners", "Heart Health"],
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    rounds: 20,
    isPremium: false,
    intensity: "Gentle",
    benefits: [
      "No breath-holds — the gentlest technique in Spiro",
      "Improves heart-rate variability over time with regular practice",
      "Good for daily baseline practice, not just acute stress",
    ],
    howTo: [
      "Sit or lie comfortably",
      "Inhale smoothly through your nose for 5 seconds",
      "Exhale smoothly through your nose or mouth for 5 seconds",
      "No pausing between breaths — keep it one continuous wave",
    ],
    precautions: [
      "Safe for most people, including breathwork beginners",
      "If your mind wanders, gently return focus to the count — that's normal",
    ],
    warnings: [
      "Do not practice while driving or operating machinery",
      "Stop if you feel unusually dizzy or unwell",
    ],
  },
  {
    id: "deep-calm",
    name: "Deep Calm",
    tagline: "6-2-8 · Extended release",
    imageUrl:
      "https://i.pinimg.com/736x/b8/21/25/b821257fb57ecc40628afc6f451a1ca0.jpg",
    goodFor: ["Acute Anxiety", "Panic", "Deep Relaxation"],
    inhale: 6,
    holdIn: 2,
    exhale: 8,
    holdOut: 0,
    rounds: 20,
    isPremium: true,
    intensity: "Advanced",
    benefits: [
      "Long exhale strongly activates the vagus nerve and calming response",
      "Effective for acute anxiety or before high-stress situations",
    ],
    howTo: [
      "Sit or lie in a quiet space",
      "Inhale deeply through your nose for 6 seconds",
      "Hold briefly for 2 seconds",
      "Exhale slowly and fully for 8 seconds — longer than the inhale is the key",
      "Repeat at a pace that feels sustainable, not forced",
    ],
    precautions: [
      "The long exhale can feel intense at first — it's normal to run out of air before 8 seconds when you're new to it",
      "Recommended after you're comfortable with Box Breathing or 4-7-8",
    ],
    warnings: [
      "Do not practice while driving, operating machinery, or in water",
      "Stop immediately if you feel dizzy, lightheaded, or short of breath",
      "If you are pregnant or have a cardiovascular, respiratory, or panic disorder, consult a doctor before use",
      "This app does not provide medical advice — seek professional care for ongoing anxiety, panic, or respiratory conditions",
    ],
  },
  {
    id: "ocean-breath",
    name: "Ocean Breath (Ujjayi)",
    tagline: "5-0-7-0 · Yogic focus breath",
    imageUrl:
      "https://i.pinimg.com/1200x/0c/6c/18/0c6c182125fb8c95c66123090b385ba5.jpg",
    goodFor: ["Focus", "Yoga Practice", "Grounding"],
    inhale: 5,
    holdIn: 0,
    exhale: 7,
    holdOut: 0,
    rounds: 20,
    isPremium: true,
    intensity: "Moderate",
    benefits: [
      "A classic yogic breath used to anchor attention during movement or meditation",
      "The soft throat constriction creates an audible 'ocean' sound that naturally slows the breath down",
    ],
    howTo: [
      "Sit or stand comfortably with a tall spine",
      "Slightly constrict the back of your throat, as if gently fogging a mirror",
      "Inhale through your nose for 5 seconds, keeping the throat constriction",
      "Exhale through your nose for 7 seconds with the same soft rasping sound",
      "Keep the sound smooth and quiet — it shouldn't feel forced or strained",
    ],
    precautions: [
      "The throat constriction should be gentle — if your throat feels tight or sore, ease off",
      "Commonly paired with yoga or stretching, but works fine seated as well",
    ],
    warnings: [
      "Stop if you feel lightheaded or your throat becomes uncomfortable",
      "Not recommended if you have a throat or vocal cord condition without medical guidance",
    ],
  },
  {
    id: "cooling-breath",
    name: "Cooling Breath",
    tagline: "4-4-6-0 · Calm the heat",
    imageUrl:
      "https://i.pinimg.com/736x/9a/c7/9b/9ac79b4dfa3e50665a5b7f3cdd59e94b.jpg",
    goodFor: ["Anxiety", "Anger Relief", "Calm"],
    inhale: 4,
    holdIn: 4,
    exhale: 6,
    holdOut: 0,
    rounds: 20,
    isPremium: true,
    intensity: "Gentle",
    benefits: [
      "Traditionally used to cool frustration, anger, or overheated stress in the moment",
      "The extended exhale relative to the inhale supports a quick shift toward calm",
    ],
    howTo: [
      "Sit comfortably in a quiet space",
      "If comfortable, curl your tongue and inhale through your mouth for 4 seconds — otherwise inhale through slightly pursed lips",
      "Hold gently for 4 seconds",
      "Exhale slowly through your nose for 6 seconds",
      "Repeat, keeping the pace unhurried",
    ],
    precautions: [
      "Not everyone can curl their tongue — inhaling through pursed lips works just as well",
      "Best used in the moment when you notice frustration or heat rising, not only as a scheduled session",
    ],
    warnings: [
      "Do not practice while driving or operating machinery",
      "Stop if you feel dizzy or unwell",
    ],
  },
  {
    id: "7-11-breathing",
    name: "7-11 Breathing",
    tagline: "7-0-11-0 · Deep unwind",
    imageUrl:
      "https://i.pinimg.com/736x/c4/a9/ff/c4a9ff119012ccf6f0216d7e6689626a.jpg",
    goodFor: ["Sleep", "Anxiety", "Deep Relaxation"],
    inhale: 7,
    holdIn: 0,
    exhale: 11,
    holdOut: 0,
    rounds: 20,
    isPremium: true,
    intensity: "Moderate",
    benefits: [
      "A simple, hold-free technique built entirely around a long, slow exhale",
      "Popular for pre-sleep wind-down and general anxiety relief without needing to hold the breath at all",
    ],
    howTo: [
      "Lie down or sit in a comfortable, quiet position",
      "Inhale gently through your nose for 7 seconds",
      "Exhale slowly and completely through your nose or mouth for 11 seconds",
      "Let the exhale be longer and softer than the inhale, without straining to finish it",
    ],
    precautions: [
      "If 11 seconds feels too long at first, it's fine to run out of air before the count ends — this smooths out with practice",
      "No holds at all, making this one of the gentler options despite the longer counts",
    ],
    warnings: [
      "Do not practice while driving or operating machinery",
      "Stop if you feel lightheaded or short of breath",
    ],
  },
  {
    id: "energizing-breath",
    name: "Energizing Breath",
    tagline: "2-0-2-0 · Quick morning boost",
    imageUrl:
      "https://i.pinimg.com/736x/0f/3e/2d/0f3e2d6a7d5843dba53396b9b673b4ed.jpg",
    // "https://i.pinimg.com/736x/d9/9c/98/d99c98e53177556372952821c7888841.jpg",
    goodFor: ["Energy", "Morning Boost", "Alertness"],
    inhale: 2,
    holdIn: 0,
    exhale: 2,
    holdOut: 0,
    rounds: 30,
    isPremium: true,
    intensity: "Advanced",
    benefits: [
      "A brisk, energizing pattern rather than a calming one — useful when you need alertness, not relaxation",
      "Short, even breaths can help shake off morning grogginess or an afternoon slump",
    ],
    howTo: [
      "Sit upright — do not practice lying down",
      "Inhale briskly through your nose for 2 seconds",
      "Exhale briskly through your nose for 2 seconds",
      "Keep breaths quick but controlled, not forced or gasping",
      "Stop earlier than 30 rounds if you feel any lightheadedness",
    ],
    precautions: [
      "This is the only energizing (rather than calming) technique in Spiro — the fast pace is intentional, not a mistake",
      "Best done seated, in the morning or when you need alertness, not right before sleep",
      "New to rapid breathing patterns? Start with far fewer rounds than the default before working up",
    ],
    warnings: [
      "Rapid breathing can cause lightheadedness, tingling in the fingers or lips, or dizziness — these are signs to stop immediately and return to normal breathing",
      "Do not practice while driving, standing, operating machinery, or in water",
      "Not recommended during pregnancy or if you have a cardiovascular, respiratory, panic, or seizure disorder — consult a doctor first",
      "This app does not provide medical advice",
    ],
  },
];

export function getTechniqueById(id: string) {
  return TECHNIQUES.find((t) => t.id === id);
}
