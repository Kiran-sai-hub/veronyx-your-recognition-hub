import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Brand />
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase text-primary-foreground/70">
            Recognition that reaches everyone
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Make great work visible, fair and rewarding.
          </h1>
          <p className="mt-5 text-base text-primary-foreground/80">
            Connect performance, manager decisions and meaningful rewards in one trusted place.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">
          Built for Indian teams and frontline workforces.
        </p>
      </section>
      <main className="grid place-items-center bg-background p-5">
        <Card className="w-full max-w-md rounded-lg border-0 shadow-none sm:border sm:shadow-sm">
          <CardHeader>
            <div className="mb-6 lg:hidden">
              <Brand />
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to Veronyx Recognise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" className="mt-2 h-11" placeholder="name@company.in" />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="h-auto p-0">
                  Forgot password?
                </Button>
              </div>
              <Input id="password" type="password" className="mt-2 h-11" />
            </div>
            <Button className="h-11 w-full" asChild>
              <a href="/onboarding">
                Sign in <ArrowRight />
              </a>
            </Button>
            <div className="relative text-center text-xs text-muted-foreground before:absolute before:left-0 before:top-1/2 before:w-[43%] before:border-t before:border-border after:absolute after:right-0 after:top-1/2 after:w-[43%] after:border-t after:border-border">
              or
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline">Google</Button>
              <Button variant="outline">Microsoft</Button>
            </div>
            <Button variant="ghost" className="w-full" asChild>
              <a href="/login/otp">
                <KeyRound />
                Sign in with mobile OTP
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function OtpLoginPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="grid min-h-screen place-items-center bg-muted p-5">
      <Card className="w-full max-w-md rounded-lg">
        <CardHeader>
          <Brand employer />
          <CardTitle className="pt-5 text-2xl">Mobile sign in</CardTitle>
          <CardDescription>
            No work email needed. We will verify your registered mobile number.
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
                    placeholder="98765 43210"
                  />
                </div>
              </div>
              <Button className="h-11 w-full" onClick={() => setSent(true)}>
                <Mail />
                Send OTP
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-md bg-success/10 p-3 text-sm text-success">
                <ShieldCheck className="mr-2 inline size-4" />
                Code sent to your registered WhatsApp number.
              </div>
              <Label>Six-digit OTP</Label>
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }, (_, index) => (
                    <InputOTPSlot key={index} index={index} className="size-11" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <Button className="h-11 w-full" asChild>
                <a href="/me">Verify and continue</a>
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setSent(false)}>
                Use a different number
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
