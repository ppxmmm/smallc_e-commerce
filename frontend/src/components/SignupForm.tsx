"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAuthSession } from "@/lib/authSession.mjs";
import { authenticateSignup, validateSignup } from "@/lib/signupValidation.mjs";

type SignupFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  marketing: boolean;
};

const initialFormState: SignupFormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  marketing: true,
};

export function SignupForm() {
  const router = useRouter();
  const formErrorId = useId();
  const nameErrorId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const confirmPasswordErrorId = useId();
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<Key extends keyof SignupFormState>(
    key: Key,
    value: SignupFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateSignup(form);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);
    const result = await authenticateSignup(form);
    setIsSubmitting(false);
    setErrors(result.errors);

    if (!result.isValid || !result.token) {
      return;
    }

    saveAuthSession({
      token: result.token,
      user: result.user ?? { email: result.values.email, name: result.values.name },
    });
    window.sessionStorage.setItem("smallc:lastSignup", result.values.email);
    router.push("/home");
  }

  return (
    <form
      aria-describedby={errors.form ? formErrorId : undefined}
      className="space-y-4"
      noValidate
      onSubmit={handleSubmit}
    >
      {errors.form ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          id={formErrorId}
          role="alert"
        >
          {errors.form}
        </p>
      ) : null}

      <div>
        <label className="text-sm font-bold text-[#10201d]" htmlFor="name">
          Full name
        </label>
        <input
          aria-describedby={errors.name ? nameErrorId : undefined}
          aria-invalid={Boolean(errors.name)}
          autoComplete="name"
          className="mt-2 w-full rounded-md border border-[#d7e1de] bg-white px-4 py-2.5 text-base text-[#10201d] outline-none transition placeholder:text-[#8a9995] focus:border-[#176c5c] focus:ring-4 focus:ring-[#45d0a2]/16"
          id="name"
          name="name"
          onChange={(event) => {
            updateField("name", event.target.value);
          }}
          placeholder="Your name"
          type="text"
          value={form.name}
        />
        {errors.name ? (
          <p className="mt-2 text-sm font-semibold text-red-700" id={nameErrorId}>
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-bold text-[#10201d]" htmlFor="email">
          Email
        </label>
        <input
          aria-describedby={errors.email ? emailErrorId : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-[#d7e1de] bg-white px-4 py-2.5 text-base text-[#10201d] outline-none transition placeholder:text-[#8a9995] focus:border-[#176c5c] focus:ring-4 focus:ring-[#45d0a2]/16"
          id="email"
          name="email"
          onChange={(event) => {
            updateField("email", event.target.value);
          }}
          placeholder="you@example.com"
          type="email"
          value={form.email}
        />
        {errors.email ? (
          <p className="mt-2 text-sm font-semibold text-red-700" id={emailErrorId}>
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-bold text-[#10201d]" htmlFor="password">
          Password
        </label>
        <div className="mt-2 grid grid-cols-[1fr_auto] overflow-hidden rounded-md border border-[#d7e1de] bg-white transition focus-within:border-[#176c5c] focus-within:ring-4 focus-within:ring-[#45d0a2]/16">
          <input
            aria-describedby={errors.password ? passwordErrorId : undefined}
            aria-invalid={Boolean(errors.password)}
            autoComplete="new-password"
            className="min-w-0 px-4 py-2.5 text-base text-[#10201d] outline-none placeholder:text-[#8a9995]"
            id="password"
            name="password"
            onChange={(event) => {
              updateField("password", event.target.value);
            }}
            placeholder="At least 8 characters"
            type={isPasswordVisible ? "text" : "password"}
            value={form.password}
          />
          <button
            aria-pressed={isPasswordVisible}
            className="border-l border-[#d7e1de] px-4 text-sm font-bold text-[#176c5c] transition hover:bg-[#f1faf7]"
            onClick={() => {
              setIsPasswordVisible((current) => !current);
            }}
            type="button"
          >
            {isPasswordVisible ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password ? (
          <p
            className="mt-2 text-sm font-semibold text-red-700"
            id={passwordErrorId}
          >
            {errors.password}
          </p>
        ) : null}
      </div>

      <div>
        <label
          className="text-sm font-bold text-[#10201d]"
          htmlFor="confirmPassword"
        >
          Confirm password
        </label>
        <input
          aria-describedby={
            errors.confirmPassword ? confirmPasswordErrorId : undefined
          }
          aria-invalid={Boolean(errors.confirmPassword)}
          autoComplete="new-password"
          className="mt-2 w-full rounded-md border border-[#d7e1de] bg-white px-4 py-2.5 text-base text-[#10201d] outline-none transition placeholder:text-[#8a9995] focus:border-[#176c5c] focus:ring-4 focus:ring-[#45d0a2]/16"
          id="confirmPassword"
          name="confirmPassword"
          onChange={(event) => {
            updateField("confirmPassword", event.target.value);
          }}
          placeholder="Repeat your password"
          type={isPasswordVisible ? "text" : "password"}
          value={form.confirmPassword}
        />
        {errors.confirmPassword ? (
          <p
            className="mt-2 text-sm font-semibold text-red-700"
            id={confirmPasswordErrorId}
          >
            {errors.confirmPassword}
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 text-sm leading-6 text-[#60706c]">
        <input
          checked={form.marketing}
          className="mt-1 size-4 rounded border-[#b9c8c4] text-[#176c5c] focus:ring-[#176c5c]"
          name="marketing"
          onChange={(event) => {
            updateField("marketing", event.target.checked);
          }}
          type="checkbox"
        />
        Send me SmallC offers and order updates.
      </label>

      <button
        className="w-full rounded-md bg-[#176c5c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e5146] focus:outline-none focus:ring-4 focus:ring-[#45d0a2]/24 disabled:cursor-not-allowed disabled:bg-[#93a29e]"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-[#60706c]">
        Already have an account?{" "}
        <Link className="font-bold text-[#176c5c] hover:text-[#0e5146]" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
