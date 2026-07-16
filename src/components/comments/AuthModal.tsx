"use client";

import { useState } from "react";
import { X, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ open, onClose, defaultTab = "login" }: Props) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [regForm, setRegForm] = useState({ username: "", email: "", password: "" });

  if (!open) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
      setUser(data.user);
      toast({ title: "Welcome back!", variant: "success" });
      onClose();
    } catch {
      toast({ title: "Login failed.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error, variant: "error" }); return; }
      setUser(data.user);
      toast({ title: "Welcome to the community! 🏈", variant: "success" });
      onClose();
    } catch {
      toast({ title: "Registration failed.", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-2xl border border-border shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-4 text-sm font-semibold capitalize transition-colors",
                tab === t
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-2xl font-bold">Welcome back! 🏈</p>
                <p className="text-sm text-muted-foreground mt-1">Sign in to join the conversation</p>
              </div>
              <Field icon={<Mail className="h-4 w-4" />} label="Email or Username">
                <input
                  type="text"
                  placeholder="your@email.com or username"
                  value={loginForm.login}
                  onChange={(e) => setLoginForm((f) => ({ ...f, login: e.target.value }))}
                  className="input-field"
                  required
                />
              </Field>
              <Field
                icon={<Lock className="h-4 w-4" />}
                label="Password"
                action={
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              >
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-field"
                  required
                />
              </Field>
              <SubmitBtn loading={loading}>Sign In</SubmitBtn>
              <p className="text-center text-sm text-muted-foreground">
                No account?{" "}
                <button type="button" onClick={() => setTab("register")} className="text-primary hover:underline font-medium">
                  Create one free
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-2xl font-bold">Join the Community 🏆</p>
                <p className="text-sm text-muted-foreground mt-1">Create your free fan account</p>
              </div>
              <Field icon={<User className="h-4 w-4" />} label="Username">
                <input
                  type="text"
                  placeholder="NFLfan2026"
                  value={regForm.username}
                  onChange={(e) => setRegForm((f) => ({ ...f, username: e.target.value }))}
                  className="input-field"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </Field>
              <Field icon={<Mail className="h-4 w-4" />} label="Email">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                  className="input-field"
                  required
                />
              </Field>
              <Field
                icon={<Lock className="h-4 w-4" />}
                label="Password"
                action={
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              >
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={regForm.password}
                  onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))}
                  className="input-field"
                  required
                  minLength={6}
                />
              </Field>
              <SubmitBtn loading={loading}>Create Account</SubmitBtn>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("login")} className="text-primary hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, action, children }: { icon: React.ReactNode; label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-muted-foreground">{icon}</span>
        <div className="w-full [&_input]:pl-9 [&_input]:pr-9">{children}</div>
        {action && <span className="absolute right-3">{action}</span>}
      </div>
    </div>
  );
}

function SubmitBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-black shadow-glow transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
