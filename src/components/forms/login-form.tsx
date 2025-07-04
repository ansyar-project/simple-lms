"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  authenticate,
  type LoginState,
  signInWithGoogle,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
      disabled={pending}
    >
      {pending ? "Signing in..." : "Sign In"}
    </Button>
  );
}

function GoogleButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full bg-white/70 backdrop-blur-sm border-blue-100 hover:bg-white/90"
      disabled={pending}
      formAction={signInWithGoogle}
    >
      {pending ? "Signing in..." : "Continue with Google"}
    </Button>
  );
}

export default function LoginForm() {
  const initialState: LoginState = { message: "", errors: {} };
  const [state, dispatch] = useActionState(authenticate, initialState);
  return (
    <div className="mx-auto max-w-sm space-y-6 bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-xl border border-blue-100">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent">
          Sign In
        </h1>
        <p className="text-gray-600">
          Enter your email below to sign in to your account
        </p>
      </div>

      <form action={dispatch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
          {state.errors?.email && (
            <p className="text-sm text-red-500">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
          {state.errors?.password && (
            <p className="text-sm text-red-500">{state.errors.password[0]}</p>
          )}
        </div>{" "}
        {state.errors?._form && (
          <p className="text-sm text-red-500">{state.errors._form[0]}</p>
        )}
        {state.message && !state.errors?._form && (
          <p className="text-sm text-green-500">{state.message}</p>
        )}
        <SubmitButton />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <GoogleButton />
      </form>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
