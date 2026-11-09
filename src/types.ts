export type User = {
  email: string;
  name: string;
};

export type SubjectId = "i2d" | "it" | "pcm";

export type Subject = {
  id: SubjectId;
  name: string;
  short: string;
  tagline: string;
  accent: string;
  chip: string;
  ring: string;
};

export type Attachment = {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
};

export type Flashcard = {
  id: string;
  subject: SubjectId;
  title: string;
  source: string;
  summary: string;
  attachment?: Attachment;
  createdAt: number;
};

export type Exercise = {
  id: string;
  subject: SubjectId;
  question: string;
  options: string[];
  answer: number;
  steps: string[];
};