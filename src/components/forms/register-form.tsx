"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { register, type RegisterState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Create Account"}
    </Button>
  );
}

export default function RegisterForm() {
  const initialState: RegisterState = { message: "", errors: {} };
  const [state, dispatch] = useActionState(register, initialState);

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Enter your information to create an account
        </p>
      </div>

      <form action={dispatch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
          />
          {state.errors?.name && (
            <p className="text-sm text-red-500">{state.errors.name[0]}</p>
          )}
        </div>
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
          />
          {state.errors?.confirmPassword && (
            <p className="text-sm text-red-500">
              {state.errors.confirmPassword[0]}
            </p>
          )}
        </div>{" "}
        <div className="space-y-2">
          <Label htmlFor="role">I want to:</Label>
          <Select name="role" defaultValue="STUDENT">
            <SelectTrigger>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STUDENT">Learn (Student)</SelectItem>
              <SelectItem value="INSTRUCTOR">Teach (Instructor)</SelectItem>
            </SelectContent>
          </Select>
          {state.errors?.role && (
            <p className="text-sm text-red-500">{state.errors.role[0]}</p>
          )}
        </div>
        {state.errors?._form && (
          <p className="text-sm text-red-500">{state.errors._form[0]}</p>
        )}
        {state.message && !state.errors?._form && (
          <p className="text-sm text-green-500">{state.message}</p>
        )}
        <SubmitButton />
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
