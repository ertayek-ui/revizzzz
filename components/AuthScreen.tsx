import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GraduationCap,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Cpu,
  FlaskConical,
  Leaf,
} from "lucide-react";
import type { User } from "@/types";

type Props = {
  onAuth: (user: User) => void;
};

export function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Renseigne ton email et ton mot de passe.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Cet email n'est pas valide.");
      return;
    }
    if (password.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Indique ton prénom pour créer ton compte.");
      return;
    }
    const displayName =
      mode === "signup"
        ? name.trim()
        : email.trim().split("@")[0].replace(/[._-]/g, " ");
    onAuth({ email: email.trim(), name: displayName });
  }

  return (
    <div className="min-h-screen bg-emerald-950 relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500 opacity-20 blur-3xl" />
      <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-teal-400 opacity-20 blur-3xl" />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="text-emerald-50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-serif text-2xl font-bold leading-none">Révis'STI2D</p>
              <p className="text-sm text-emerald-300 mt-1">Ta révision, simplifiée.</p>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
            Transforme tes cours en fiches claires.
          </h1>
          <p className="text-emerald-200 max-w-md">
            Colle ton cours ou joins un PDF, génère une fiche de révision structurée,
            entraîne-toi avec des QCM corrigés — et retrouve tout à chaque connexion.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            <Feature icon={<Leaf className="h-5 w-5" />} label="I2D" />
            <Feature icon={<Cpu className="h-5 w-5" />} label="IT" />
            <Feature icon={<FlaskConical className="h-5 w-5" />} label="PC & Maths" />
          </div>
        </div>

        <Card className="rounded-2xl border-emerald-800 bg-white shadow-2xl">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === "signup"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Inscription
              </button>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                {mode === "login" ? "Bon retour !" : "Créer mon compte"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "login"
                  ? "Connecte-toi pour retrouver tes fiches."
                  : "Quelques secondes et c'est parti."}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Prénom</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Léa"
                      className="h-12 pl-10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="eleve@exemple.fr"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 pl-10"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
              >
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              Ta connexion est mémorisée sur cet appareil : tu resteras connecté(e)
              même après avoir fermé l'application.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl bg-emerald-900 border border-emerald-800 px-3 py-3 flex flex-col items-center gap-2">
      <span className="text-emerald-400">{icon}</span>
      <span className="text-xs font-semibold text-emerald-100">{label}</span>
    </div>
  );
}