import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  LogOut,
  Sparkles,
  Save,
  Trash2,
  BookOpen,
  Dumbbell,
  PlusCircle,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  FileText,
  Upload,
  X,
  Download,
} from "lucide-react";
import { SUBJECTS, EXERCISES } from "@/lib/data";
import { downloadTxt } from "@/lib/pdf";
import { DownloadMenu } from "@/components/DownloadMenu";
import type {
  Attachment,
  Exercise,
  Flashcard,
  Subject,
  SubjectId,
  User,
} from "@/types";

type Props = {
  user: User;
  onLogout: () => void;
};

type Tab = "generate" | "library" | "train";

function generateSummary(raw: string): string {
  const clean = raw.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  const formulaRegex =
    /([a-zA-Z]\s*=\s*[^.;,]+)|(\b\d+(?:[.,]\d+)?\s*(?:kWh|W|J|m\/s|km\/h|V|A|Ω|N|Pa|°C|%)\b)/g;
  const formulas = Array.from(new Set(clean.match(formulaRegex) ?? [])).slice(0, 4);

  const keywords = [
    "énergie", "rendement", "matériau", "cycle de vie", "capteur", "signal",
    "prototype", "impression", "vitesse", "force", "dérivée", "fonction",
    "puissance", "tension", "intensité", "recyclage", "conception",
  ];
  const notions = keywords.filter((k) => clean.toLowerCase().includes(k));

  const keySentences = sentences.slice(0, 4);

  let out = "";
  if (notions.length) {
    out += `**Notions clés :** ${notions
      .map((n) => `**${n.charAt(0).toUpperCase() + n.slice(1)}**`)
      .join(" · ")}\n\n`;
  }
  if (keySentences.length) {
    out += "**À retenir :**\n";
    keySentences.forEach((s) => {
      out += `- ${s}\n`;
    });
    out += "\n";
  }
  if (formulas.length) {
    out += "**Formules & valeurs :**\n";
    formulas.forEach((f) => {
      out += `> ${f.trim()}\n`;
    });
    out += "\n";
  }
  if (!out) {
    out = `**Résumé :**\n- ${clean.slice(0, 220)}…\n`;
  }
  return out.trim();
}

function renderSummary(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    if (line.startsWith("> ")) {
      return (
        <div
          key={i}
          className="my-2 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 px-4 py-2 font-mono text-sm text-emerald-900"
        >
          {line.slice(2)}
        </div>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="ml-4 list-disc text-sm text-slate-700 leading-relaxed">
          {boldify(line.slice(2))}
        </li>
      );
    }
    return (
      <p key={i} className="text-sm text-slate-700 leading-relaxed">
        {boldify(line)}
      </p>
    );
  });
}

function boldify(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-slate-900">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function Dashboard({ user, onLogout }: Props) {
  const [subjectId, setSubjectId] = useState<SubjectId>("i2d");
  const [tab, setTab] = useState<Tab>("generate");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [raw, setRaw] = useState("");
  const [title, setTitle] = useState("");
  const [generated, setGenerated] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [fileError, setFileError] = useState("");
  const [openCard, setOpenCard] = useState<Flashcard | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const subject = SUBJECTS.find((s) => s.id === subjectId) as Subject;
  const subjectCards = useMemo(
    () => cards.filter((c) => c.subject === subjectId),
    [cards, subjectId]
  );

  function handleFile(file: File | undefined) {
    setFileError("");
    if (!file) return;
    if (file.type !== "application/pdf") {
      setFileError("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setFileError("Le PDF est trop lourd (max 4 Mo).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: String(reader.result),
      });
    };
    reader.readAsDataURL(file);
  }

  function handleGenerate() {
    const summary = generateSummary(raw);
    setGenerated(summary);
  }

  function handleSave() {
    if (!generated && !attachment) return;
    const card: Flashcard = {
      id: `${Date.now()}`,
      subject: subjectId,
      title:
        title.trim() ||
        attachment?.name.replace(/\.pdf$/i, "") ||
        `Fiche ${subject.short} — ${new Date().toLocaleDateString("fr-FR")}`,
      source: raw,
      summary:
        generated ||
        "**Document joint :**\n- Consulte le PDF ci-dessous pour réviser ce cours.",
      attachment: attachment ?? undefined,
      createdAt: Date.now(),
    };
    setCards((prev) => [card, ...prev]);
    setGenerated("");
    setRaw("");
    setTitle("");
    setAttachment(null);
    setTab("library");
  }

  function handleDelete(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (openCard?.id === id) setOpenCard(null);
  }

  const previewCard: Flashcard | null =
    generated || attachment
      ? {
          id: "preview",
          subject: subjectId,
          title:
            title.trim() ||
            attachment?.name.replace(/\.pdf$/i, "") ||
            `Fiche ${subject.short} — ${new Date().toLocaleDateString("fr-FR")}`,
          source: raw,
          summary:
            generated ||
            "**Document joint :**\n- Consulte le PDF ci-dessous pour réviser ce cours.",
          attachment: attachment ?? undefined,
          createdAt: Date.now(),
        }
      : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-emerald-900 text-emerald-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-serif text-lg font-bold leading-none">Révis'STI2D</p>
              <p className="text-xs text-emerald-300 mt-1">Salut {user.name} 👋</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-emerald-100 hover:bg-emerald-800 hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SUBJECTS.map((s) => {
            const active = s.id === subjectId;
            const count = cards.filter((c) => c.subject === s.id).length;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSubjectId(s.id);
                  setTab("generate");
                  setGenerated("");
                  setOpenCard(null);
                }}
                className={`text-left rounded-2xl border p-4 transition shadow-sm hover:shadow-md ${
                  active
                    ? "bg-white border-emerald-300 ring-2 ring-emerald-200"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${s.chip}`}>
                    {s.short}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {count} fiche{count > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mt-3 font-semibold text-slate-900 text-sm leading-snug">
                  {s.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{s.tagline}</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm w-full sm:w-auto sm:inline-flex">
          <TabButton
            active={tab === "generate"}
            onClick={() => setTab("generate")}
            icon={<PlusCircle className="h-4 w-4" />}
          >
            Générer
          </TabButton>
          <TabButton
            active={tab === "library"}
            onClick={() => setTab("library")}
            icon={<BookOpen className="h-4 w-4" />}
          >
            Ma Bibliothèque
          </TabButton>
          <TabButton
            active={tab === "train"}
            onClick={() => setTab("train")}
            icon={<Dumbbell className="h-4 w-4" />}
          >
            S'entraîner
          </TabButton>
        </div>

        {tab === "generate" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  Colle ton cours brut
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Titre de la fiche (optionnel)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11"
                />
                <Textarea
                  placeholder="Colle ici le contenu de ton cours…"
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  className="min-h-40 resize-y"
                />

                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Joindre un cours en PDF
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  {attachment ? (
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-white border border-slate-200 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatSize(attachment.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAttachment(null)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        aria-label="Retirer le PDF"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                      className="w-full h-11 border-slate-300"
                    >
                      <Upload className="h-4 w-4 mr-2" /> Choisir un PDF
                    </Button>
                  )}
                  {fileError && (
                    <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                      {fileError}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!raw.trim()}
                  className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" /> Générer la fiche
                </Button>
              </CardContent>
            </Card>

            <Card className={`rounded-2xl shadow-sm border-slate-200 ring-1 ${subject.ring}`}>
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center justify-between">
                  <span>Aperçu de la fiche</span>
                  <Badge className={subject.chip}>{subject.short}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewCard ? (
                  <>
                    {generated && (
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1">
                        {renderSummary(generated)}
                      </div>
                    )}
                    {attachment && (
                      <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2">
                        <FileText className="h-4 w-4 text-rose-500" />
                        <span className="text-sm text-rose-900 truncate">
                          {attachment.name}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={handleSave}
                        className="h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800"
                      >
                        <Save className="h-4 w-4 mr-2" /> Enregistrer
                      </Button>
                      <DownloadMenu card={previewCard} subject={subject} />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <Sparkles className="h-7 w-7 text-emerald-500" />
                    </div>
                    <p className="font-semibold text-slate-800">Aucune fiche générée</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Colle ton cours ou joins un PDF, puis clique sur « Générer la fiche ».
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "library" && (
          <div className="space-y-4">
            {openCard ? (
              <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenCard(null)}
                        className="mb-2 -ml-2 text-muted-foreground"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Retour
                      </Button>
                      <CardTitle className="font-serif text-xl">{openCard.title}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(openCard.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        onClick={() => downloadTxt(openCard, subject)}
                        className="text-emerald-700 hover:bg-emerald-50"
                      >
                        <Download className="h-4 w-4 mr-2" /> .txt
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(openCard.id)}
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-1">
                    {renderSummary(openCard.summary)}
                  </div>

                  <DownloadMenu
                    card={openCard}
                    subject={subject}
                    variant="solid"
                    className="max-w-xs"
                  />

                  {openCard.attachment && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-5 w-5 text-rose-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-rose-900 truncate">
                              {openCard.attachment.name}
                            </p>
                            <p className="text-xs text-rose-700">
                              {formatSize(openCard.attachment.size)}
                            </p>
                          </div>
                        </div>
                        <a
                          href={openCard.attachment.dataUrl}
                          download={openCard.attachment.name}
                          className="inline-flex items-center gap-1 rounded-lg bg-white border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition"
                        >
                          <Download className="h-4 w-4" /> Ouvrir
                        </a>
                      </div>
                      <iframe
                        title={openCard.attachment.name}
                        src={openCard.attachment.dataUrl}
                        className="w-full h-96 rounded-lg border border-rose-200 bg-white"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : subjectCards.length === 0 ? (
              <Card className="rounded-2xl shadow-sm border-slate-200">
                <CardContent className="flex flex-col items-center justify-center text-center py-16 gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-emerald-500" />
                  </div>
                  <p className="font-semibold text-slate-800">
                    Ta bibliothèque {subject.short} est vide
                  </p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Génère une fiche ou joins un PDF puis enregistre-la pour la retrouver ici.
                  </p>
                  <Button
                    onClick={() => setTab("generate")}
                    className="mt-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Créer une fiche
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {subjectCards.map((c) => (
                  <Card
                    key={c.id}
                    className="rounded-2xl shadow-sm border-slate-200 hover:shadow-md transition"
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={subject.chip}>{subject.short}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <button
                        onClick={() => setOpenCard(c)}
                        className="text-left w-full"
                      >
                        <p className="font-semibold text-slate-900 leading-snug hover:text-emerald-700 transition">
                          {c.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {c.summary.replace(/[*>#-]/g, "").slice(0, 110)}…
                        </p>
                      </button>
                      {c.attachment && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-600 pt-1">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="truncate">{c.attachment.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOpenCard(c)}
                          className="flex-1 border-slate-300"
                        >
                          <BookOpen className="h-4 w-4 mr-1.5" /> Ouvrir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadTxt(c, subject)}
                          className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Download className="h-4 w-4 mr-1.5" /> .txt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "train" && <Trainer subjectId={subjectId} />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        active ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Trainer({ subjectId }: { subjectId: SubjectId }) {
  const exercises = useMemo(
    () => EXERCISES.filter((e) => e.subject === subjectId),
    [subjectId]
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current: Exercise | undefined = exercises[index];

  function reset() {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  if (!current) {
    return (
      <Card className="rounded-2xl shadow-sm border-slate-200">
        <CardContent className="py-16 text-center text-muted-foreground">
          Aucun exercice disponible pour cette matière.
        </CardContent>
      </Card>
    );
  }

  if (done) {
    const pct = Math.round((score / exercises.length) * 100);
    return (
      <Card className="rounded-2xl shadow-sm border-slate-200">
        <CardContent className="py-12 flex flex-col items-center text-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="font-serif text-2xl font-bold text-slate-900">
            {score} / {exercises.length} bonnes réponses
          </p>
          <p className="text-sm text-muted-foreground">
            Score : {pct}% — {pct >= 70 ? "Excellent travail !" : "Continue à t'entraîner !"}
          </p>
          <Button onClick={reset} className="bg-emerald-600 hover:bg-emerald-700 h-11 px-6">
            Recommencer
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCorrect = picked === current.answer;

  return (
    <Card className="rounded-2xl shadow-sm border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className="bg-slate-100 text-slate-700">
            Question {index + 1} / {exercises.length}
          </Badge>
          <span className="text-sm text-muted-foreground">Score : {score}</span>
        </div>
        <CardTitle className="font-serif text-lg sm:text-xl leading-snug pt-2">
          {current.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {current.options.map((opt, i) => {
          const chosen = picked === i;
          const reveal = picked !== null;
          const good = i === current.answer;
          let cls =
            "w-full text-left rounded-xl border px-4 py-3 text-sm font-medium transition";
          if (!reveal) {
            cls += " border-slate-200 hover:border-emerald-400 hover:bg-emerald-50";
          } else if (good) {
            cls += " border-emerald-400 bg-emerald-50 text-emerald-900";
          } else if (chosen) {
            cls += " border-rose-400 bg-rose-50 text-rose-900";
          } else {
            cls += " border-slate-200 text-slate-500";
          }
          return (
            <button
              key={i}
              disabled={reveal}
              onClick={() => {
                setPicked(i);
                if (i === current.answer) setScore((s) => s + 1);
              }}
              className={cls}
            >
              <span className="inline-flex items-center gap-2">
                {reveal && good && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                {reveal && chosen && !good && <XCircle className="h-4 w-4 text-rose-600" />}
                {opt}
              </span>
            </button>
          );
        })}

        {picked !== null && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Lightbulb className="h-4 w-4 text-amber-500" /> Correction pas à pas
            </p>
            <ol className="space-y-1">
              {current.steps.map((s, i) => (
                <li key={i} className="text-sm text-slate-700 flex gap-2">
                  <span className="font-semibold text-emerald-600">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ol>
            <p
              className={`text-sm font-semibold ${
                isCorrect ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {isCorrect ? "Bonne réponse !" : "Réponse incorrecte."}
            </p>
          </div>
        )}

        {picked !== null && (
          <Button
            onClick={() => {
              if (index + 1 >= exercises.length) {
                setDone(true);
              } else {
                setIndex((i) => i + 1);
                setPicked(null);
              }
            }}
            className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800"
          >
            {index + 1 >= exercises.length ? "Voir mon score" : "Question suivante"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}