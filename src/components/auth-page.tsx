import {
  ArrowRight,
  Building2,
  KeyRound,
  MessageCircle,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { go } from "@/lib/navigate";
import { personaUser } from "@/lib/navigation";
import { type Persona, personaHome, useAppStore } from "@/store/app-store";

const demoRoles: { persona: Persona; title: string; detail: string; icon: typeof UserRound }[] = [
  {
    persona: "owner",
    title: "Owner / MD",
    detail: "Pulse, pending decisions, fairness",
    icon: Building2,
  },
  {
    persona: "hr",
    title: "HR Admin",
    detail: "Programmes, data health, compliance",
    icon: ShieldCheck,
  },
  {
    persona: "manager",
    title: "Team Manager",
    detail: "Team approvals, wallet, recognise",
    icon: Users,
  },
  {
    persona: "employee",
    title: "Employee",
    detail: "Points, tracking, redeem, shoutouts",
    icon: UserRound,
  },
];

export function LoginPage({ expired = false }: { expired?: boolean }) {
  const setPersona = useAppStore((s) => s.setPersona);
  const [email, setEmail] = useState("ramesh@rkmills.in");
  const [password, setPassword] = useState("demo-password");
  const [error, setError] = useState("");

  const enterAs = (persona: Persona) => {
    setPersona(persona);
    go(personaHome[persona]);
  };

  const signIn = (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid work email.");
    if (!password) return setError("Enter your password.");
    setError("");
    enterAs("owner");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <aside
        aria-label="About Veronyx Recognise"
        className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between"
      >
        <Brand className="[&_p]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/90" />
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase text-primary-foreground/90">
            Recognition that reaches everyone
          </p>
          <p className="mt-4 text-4xl font-bold leading-tight">
            Make great work visible, fair and rewarding.
          </p>
          <p className="mt-5 text-base text-primary-foreground">
            Connect performance data, manager decisions and meaningful rewards in one trusted place
            — on the web, on WhatsApp and on the factory floor.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/90">
          Built for Indian SMEs and frontline teams.
        </p>
      </aside>
      <main className="flex min-w-0 items-center justify-center bg-background p-4 sm:p-5">
        <div className="w-full min-w-0 max-w-md space-y-6">
          <Card className="rounded-lg border-0 shadow-none sm:border sm:shadow-sm">
            <CardHeader>
              <div className="mb-6 lg:hidden">
                <Brand />
              </div>
              <h1 className="text-2xl font-semibold leading-none tracking-tight">Welcome back</h1>
              <CardDescription>Sign in to Veronyx Recognise.</CardDescription>
            </CardHeader>
            <CardContent>
              {expired && (
                <p
                  role="alert"
                  className="mb-5 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm"
                >
                  Your session expired. Please log in again.
                </p>
              )}
              <form className="space-y-5" onSubmit={signIn} noValidate>
                <div>
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="mt-2 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "login-error" : undefined}
                  />
                </div>
                <div>
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button type="button" variant="link" className="h-auto p-0">
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="mt-2 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <p id="login-error" role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button type="submit" className="h-11 w-full">
                  Sign in <ArrowRight />
                </Button>
              </form>
              <div className="relative my-5 text-center text-xs text-muted-foreground before:absolute before:left-0 before:top-1/2 before:w-[43%] before:border-t before:border-border after:absolute after:right-0 after:top-1/2 after:w-[43%] after:border-t after:border-border">
                or
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-11" onClick={() => enterAs("owner")}>
                  Google
                </Button>
                <Button variant="outline" className="h-11" onClick={() => enterAs("hr")}>
                  Microsoft
                </Button>
              </div>
              <Button variant="ghost" className="mt-3 h-11 w-full" asChild>
                <a href="/login/otp">
                  <KeyRound />
                  No work email? Sign in with mobile OTP
                </a>
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                New to Veronyx?{" "}
                <a href="/onboarding" className="font-medium text-primary hover:underline">
                  Create your organisation
                </a>
              </p>
            </CardContent>
          </Card>

          <section
            aria-labelledby="demo-roles"
            className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4"
          >
            <h2 id="demo-roles" className="text-sm font-semibold">
              Demo: explore as
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Prototype data for Radha Krishna Mills. You can switch role any time from the top bar.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {demoRoles.map((role) => (
                <button
                  key={role.persona}
                  type="button"
                  onClick={() => enterAs(role.persona)}
                  className="flex min-h-11 items-start gap-2 rounded-md border border-border bg-background p-3 text-left hover:border-primary"
                >
                  <role.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    <span className="block text-sm font-medium">{role.title}</span>
                    <span className="block text-xs text-muted-foreground">{role.detail}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const DEMO_OTP = "246810";

export function OtpLoginPage() {
  const setPersona = useAppStore((s) => s.setPersona);
  const [mobile, setMobile] = useState("98765 43210");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const locked = attempts >= 3;
  const digits = mobile.replace(/\D/g, "");

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const send = () => {
    setSent(true);
    setOtp("");
    setResendIn(30);
  };

  const verify = () => {
    if (otp === DEMO_OTP) {
      setPersona("employee");
      go("/me");
      return;
    }
    setAttempts((a) => a + 1);
    setOtp("");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-muted p-5">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <Brand employer />
          <h1 className="pt-5 text-2xl font-semibold leading-none tracking-tight">
            Mobile sign in
          </h1>
          <CardDescription>
            For frontline staff without a work email. We will send a code to your registered
            WhatsApp or mobile number.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!sent ? (
            <>
              <div>
                <Label htmlFor="mobile">Mobile number</Label>
                <div className="mt-2 flex">
                  <div className="grid h-11 place-items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm">
                    +91
                  </div>
                  <Input
                    id="mobile"
                    inputMode="numeric"
                    className="h-11 rounded-l-none"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    aria-invalid={digits.length > 0 && digits.length !== 10}
                    aria-describedby="mobile-help"
                  />
                </div>
                <p
                  id="mobile-help"
                  className={
                    digits.length > 0 && digits.length !== 10
                      ? "mt-1 text-xs text-destructive"
                      : "mt-1 text-xs text-muted-foreground"
                  }
                >
                  {digits.length > 0 && digits.length !== 10
                    ? "Enter a 10-digit mobile number."
                    : "Use the number HR has on file for you."}
                </p>
              </div>
              <Button className="h-11 w-full" onClick={send} disabled={digits.length !== 10}>
                <MessageCircle />
                Send OTP on WhatsApp
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <a href="/login">Sign in with email instead</a>
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-md bg-success/10 p-3 text-sm text-success">
                <ShieldCheck className="mr-2 inline size-4" />
                Code sent to +91 {mobile} on WhatsApp. Demo code: {DEMO_OTP}
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Six-digit OTP</Label>
                <InputOTP id="otp" maxLength={6} value={otp} onChange={setOtp} disabled={locked}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTPSlot key={index} index={index} className="size-11" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {attempts > 0 && !locked && (
                  <p role="alert" className="text-sm text-destructive">
                    That code did not match. {3 - attempts} attempt{3 - attempts === 1 ? "" : "s"}{" "}
                    left.
                  </p>
                )}
                {locked && (
                  <p role="alert" className="text-sm text-destructive">
                    Too many wrong codes. For your safety, sign-in is locked for 30 minutes.
                  </p>
                )}
              </div>
              <Button
                className="h-11 w-full"
                onClick={verify}
                disabled={otp.length !== 6 || locked}
              >
                Verify and continue
              </Button>
              <div className="flex items-center justify-between text-sm">
                <Button variant="ghost" onClick={() => setSent(false)}>
                  Change number
                </Button>
                <Button variant="link" disabled={resendIn > 0 || locked} onClick={send}>
                  {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Signing in as {personaUser.employee.name} for the demo.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
