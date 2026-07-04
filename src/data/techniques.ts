export interface Technique {
  id: string;
  name: string;
  tagline: string;
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
      "If you have low blood pressure, stand up slowly after practicing — don't rise quickly right after a session",
    ],
    warnings: [
      "Do not practice while driving, operating machinery, or in water",
      "Stop immediately if you feel dizzy, short of breath, or unwell — resume normal breathing",
      "If you are pregnant or have a heart, lung, or panic disorder, consult a doctor before trying breath-hold techniques",
    ],
  },
  {
    id: "coherent-breathing",
    name: "Coherent Breathing",
    tagline: "5-5 · Even, grounding",
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
      "Exhale slowly and fully for 8 seconds — longer than the inhale is the key to this one",
      "Repeat at a pace that feels sustainable, not forced",
    ],
    precautions: [
      "The long exhale can feel intense at first — it's normal to run out of air before 8 seconds when you're new to it. Don't force it; let the count adjust to your comfort as you practice",
      "Recommended after you're comfortable with Box Breathing or 4-7-8",
    ],
    warnings: [
      "Do not practice while driving, operating machinery, or in water",
      "Stop immediately if you feel dizzy, lightheaded, or short of breath",
      "If you are pregnant or have a cardiovascular, respiratory, or panic disorder, consult a doctor before use",
      "This app does not provide medical advice — seek professional care for ongoing anxiety, panic, or respiratory conditions",
    ],
  },
];

export function getTechniqueById(id: string) {
  return TECHNIQUES.find((t) => t.id === id);
}
