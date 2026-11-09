import { AuthScreen } from "@/components/AuthScreen";
import { Dashboard } from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap } from "lucide-react";

export default function App() {
  const { user, ready, login, logout } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center animate-pulse">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>
        <p className="text-emerald-200 text-sm">Chargement de ta session…</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={login} />;
  }

  return <Dashboard user={user} onLogout={logout} />;
}