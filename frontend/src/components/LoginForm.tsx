"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { authenticateLogin, validateLogin } from "@/lib/loginValidation.mjs";

type FormState = {
  email: string;
  password: string;
  remember: boolean;
};

const initialFormState: FormState = {
  email: "",
  password: "",
  remember: false,
};

export function LoginForm() {
  const router = useRouter();
  const formErrorId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values = {
      email: form.email,
      password: form.password,
    };
    const validation = validateLogin(values);

    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);
    const result = await authenticateLogin(values);
    setIsSubmitting(false);
    setErrors(result.errors);

    if (!result.isValid) {
      return;
    }

    if (form.remember) {
      window.localStorage.setItem("smallc:rememberedEmail", result.values.email);
    } else {
      window.localStorage.removeItem("smallc:rememberedEmail");
    }

    window.sessionStorage.setItem("smallc:lastLogin", result.values.email);
    router.push("/home");
  }

  return (
    <form
      aria-describedby={errors.form ? formErrorId : undefined}
      className="space-y-5"
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
        <label className="text-sm font-bold text-[#10201d]" htmlFor="email">
          Email
        </label>
        <input
          aria-describedby={errors.email ? emailErrorId : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-[#d7e1de] bg-white px-4 py-3 text-base text-[#10201d] outline-none transition placeholder:text-[#8a9995] focus:border-[#176c5c] focus:ring-4 focus:ring-[#45d0a2]/16"
          id="email"
          name="email"
          onChange={(event) => {
            setForm((current) => ({ ...current, email: event.target.value }));
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
            autoComplete="current-password"
            className="min-w-0 px-4 py-3 text-base text-[#10201d] outline-none placeholder:text-[#8a9995]"
            id="password"
            name="password"
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }));
            }}
            placeholder="Enter your password"
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
          <p className="mt-2 text-sm font-semibold text-red-700" id={passwordErrorId}>
            {errors.password}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-[#60706c]">
          <input
            checked={form.remember}
            className="size-4 rounded border-[#b9c8c4] text-[#176c5c] focus:ring-[#176c5c]"
            name="remember"
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                remember: event.target.checked,
              }));
            }}
            type="checkbox"
          />
          Remember me
        </label>
        <a
          className="text-sm font-bold text-[#176c5c] hover:text-[#0e5146]"
          href="#"
        >
          Forgot password?
        </a>
      </div>

      <button
        className="w-full rounded-md bg-[#176c5c] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#0e5146] focus:outline-none focus:ring-4 focus:ring-[#45d0a2]/24 disabled:cursor-not-allowed disabled:bg-[#93a29e]"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-[#60706c]">
        Demo account: customer@smallc.test / correct-password
      </p>
      <p className="text-center text-sm text-[#60706c]">
        New to SmallC?{" "}
        <Link className="font-bold text-[#176c5c] hover:text-[#0e5146]" href="/signup">
          Create an account
        </Link>
      </p>
    </form>
  );
}
