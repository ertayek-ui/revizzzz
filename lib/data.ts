import type { Exercise, Subject } from "@/types";

export const SUBJECTS: Subject[] = [
  {
    id: "i2d",
    name: "Ingénierie et Développement Durable",
    short: "I2D",
    tagline: "Énergie, matériaux, cycle de vie",
    accent: "text-emerald-700",
    chip: "bg-emerald-100 text-emerald-800",
    ring: "ring-emerald-200",
  },
  {
    id: "it",
    name: "Innovation Technologique",
    short: "IT",
    tagline: "Prototypage, objets connectés, design",
    accent: "text-amber-700",
    chip: "bg-amber-100 text-amber-800",
    ring: "ring-amber-200",
  },
  {
    id: "pcm",
    name: "Physique-Chimie et Mathématiques",
    short: "PCM",
    tagline: "Lois physiques, calculs, mesures",
    accent: "text-sky-700",
    chip: "bg-sky-100 text-sky-800",
    ring: "ring-sky-200",
  },
];

export const EXERCISES: Exercise[] = [
  {
    id: "i2d-1",
    subject: "i2d",
    question:
      "Une maison consomme 12 000 kWh d'énergie utile par an. Son rendement global est de 80 %. Quelle est l'énergie finale consommée ?",
    options: ["9 600 kWh", "15 000 kWh", "12 800 kWh", "24 000 kWh"],
    answer: 1,
    steps: [
      "Rendement η = énergie utile / énergie finale.",
      "Donc énergie finale = énergie utile / η.",
      "Application : 12 000 / 0,80 = 15 000 kWh.",
    ],
  },
  {
    id: "i2d-2",
    subject: "i2d",
    question:
      "Dans une analyse de cycle de vie (ACV), quelle étape vient en premier ?",
    options: [
      "Fin de vie / recyclage",
      "Extraction des matières premières",
      "Transport du produit fini",
      "Utilisation par le client",
    ],
    answer: 1,
    steps: [
      "L'ACV suit le produit « du berceau à la tombe ».",
      "La première phase est l'extraction des matières premières.",
      "Viennent ensuite fabrication, transport, utilisation, puis fin de vie.",
    ],
  },
  {
    id: "it-1",
    subject: "it",
    question:
      "Quel capteur délivre un signal analogique qu'il faut convertir via un CAN ?",
    options: [
      "Un interrupteur fin de course",
      "Une thermistance (CTN)",
      "Un bouton poussoir",
      "Un relais",
    ],
    answer: 1,
    steps: [
      "Un interrupteur, un bouton et un relais sont des composants tout-ou-rien (logique).",
      "Une thermistance varie continûment avec la température : signal analogique.",
      "Il faut donc un Convertisseur Analogique-Numérique (CAN) pour la lire.",
    ],
  },
  {
    id: "it-2",
    subject: "it",
    question:
      "En prototypage rapide, quel procédé construit l'objet couche par couche ?",
    options: [
      "Le fraisage CNC",
      "L'impression 3D (FDM)",
      "Le thermoformage",
      "Le moulage par injection",
    ],
    answer: 1,
    steps: [
      "Le fraisage et le moulage retirent ou injectent de la matière.",
      "L'impression 3D FDM dépose la matière couche par couche.",
      "C'est la définition de la fabrication additive.",
    ],
  },
  {
    id: "pcm-1",
    subject: "pcm",
    question:
      "Un mobile parcourt 150 m en 10 s. Quelle est sa vitesse moyenne ?",
    options: ["1,5 m/s", "15 m/s", "1500 m/s", "0,15 m/s"],
    answer: 1,
    steps: [
      "v = d / t.",
      "Application : v = 150 / 10.",
      "v = 15 m/s (soit 54 km/h).",
    ],
  },
  {
    id: "pcm-2",
    subject: "pcm",
    question:
      "Quelle est la dérivée de f(x) = 3x² + 2x − 5 ?",
    options: ["6x + 2", "3x + 2", "6x² + 2", "6x − 5"],
    answer: 0,
    steps: [
      "Dérivée de 3x² : 3 × 2x = 6x.",
      "Dérivée de 2x : 2.",
      "Dérivée de la constante −5 : 0.",
      "Donc f'(x) = 6x + 2.",
    ],
  },
];