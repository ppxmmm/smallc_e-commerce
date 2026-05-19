import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  eyebrow?: string;
  mode: "login" | "signup";
  title: string;
  description: string;
};

export function AuthShell({
  children,
  description,
  mode,
  title,
}: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <main className="h-screen overflow-hidden bg-[#f3f5f4] text-[#121b22]">
      <section className="mx-auto grid h-screen w-full max-w-[1500px] grid-rows-[minmax(0,1fr)_72px] overflow-hidden rounded-none border border-[#dfe5e3] bg-white shadow-[0_24px_80px_rgba(17,28,35,0.08)] lg:rounded-lg">
        <div className="grid min-h-0 lg:grid-cols-[1.15fr_0.85fr]">
        <aside className="relative min-h-0 overflow-hidden bg-white px-8 py-8 sm:px-12 lg:px-16 lg:py-12">
          <div className="relative z-10 max-w-xl">
            <Link
              className="text-5xl font-bold leading-none tracking-normal text-[#06463e] sm:text-6xl lg:text-7xl"
              href="/"
            >
              SmallC
            </Link>
            <h1 className="mt-12 text-4xl font-bold leading-tight tracking-normal text-[#121b22] sm:text-5xl lg:mt-14">
              Welcome back
            </h1>
            <p className="mt-4 text-xl leading-8 text-[#66717a]">
              Sign in to continue shopping
            </p>

            <div className="mt-8 space-y-6">
              {[
                ["Curated products", "Thoughtfully selected items you'll love."],
                ["Secure checkout", "Safe payments and trusted protection."],
                ["Fast, reliable delivery", "Quick dispatch and easy returns."],
              ].map(([heading, copy]) => (
                <div className="flex items-start gap-5" key={heading}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-md border-2 border-[#07574d] text-sm font-black text-[#07574d]">
                    {heading.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-base font-bold text-[#121b22]">
                      {heading}
                    </span>
                    <span className="mt-1 block text-base leading-7 text-[#66717a]">
                      {copy}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 right-8 hidden h-[300px] w-[420px] lg:block">
            <div className="absolute bottom-0 left-12 h-28 w-80 rounded-md bg-[#e7ded0] shadow-[0_20px_55px_rgba(55,43,31,0.22)]" />
            <div className="absolute bottom-24 left-28 h-24 w-48 rounded-md bg-[#c69b62] shadow-[0_14px_35px_rgba(55,43,31,0.18)]" />
            <div className="absolute bottom-3 left-0 h-40 w-64 rounded-md bg-[#143f38] shadow-[0_24px_65px_rgba(20,63,56,0.30)]">
              <span className="grid h-full place-items-center text-3xl font-bold text-white">
                SmallC
              </span>
            </div>
          </div>
          <div className="pointer-events-none absolute right-0 top-28 hidden h-12 w-72 rounded-l-md bg-[#f5f2ec] shadow-[0_14px_35px_rgba(17,28,35,0.10)] lg:block" />
          <div className="pointer-events-none absolute right-12 top-20 hidden size-36 rounded-md bg-[#e6ded3] lg:block" />
          <div className="pointer-events-none absolute right-40 top-24 hidden h-36 w-28 rounded-md bg-[#123f38] lg:block" />
        </aside>

        <section className="flex min-h-0 items-center justify-center border-t border-[#e4e9e7] bg-white px-6 py-6 sm:px-10 lg:border-l lg:border-t-0 lg:px-16">
          <div className="w-full max-w-[440px]">
            <div className="mb-8 grid grid-cols-2 border-b border-[#d8dfdd] text-center">
              <Link
                className={`pb-4 text-lg font-bold transition ${
                  isLogin
                    ? "border-b-4 border-[#07574d] text-[#07574d]"
                    : "text-[#66717a] hover:text-[#07574d]"
                }`}
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className={`pb-4 text-lg font-bold transition ${
                  !isLogin
                    ? "border-b-4 border-[#07574d] text-[#07574d]"
                    : "text-[#66717a] hover:text-[#07574d]"
                }`}
                href="/signup"
              >
                Create account
              </Link>
            </div>
            <div className="mb-6">
              <h2 className="text-3xl font-bold leading-tight tracking-normal text-[#121b22] sm:text-4xl">
                {title}
              </h2>
              <p className="mt-3 text-base leading-7 text-[#66717a]">
                {description}
              </p>
            </div>
            {children}
          </div>
        </section>
        </div>
        <AuthFooter />
      </section>
    </main>
  );
}

function AuthFooter() {
  return (
    <footer className="grid grid-cols-2 items-center border-t border-[#dfe5e3] bg-white px-6 text-sm font-medium text-[#66717a] sm:grid-cols-4 sm:px-14">
      {[
        ["shipping", "Free shipping on orders $50+"],
        ["returns", "Easy returns within 30 days"],
        ["secure", "Secure payments"],
        ["support", "Customer support"],
      ].map(([icon, label]) => (
        <div className="flex items-center justify-center gap-3" key={label}>
          <FooterIcon name={icon} />
          <span className="hidden sm:inline">{label}</span>
        </div>
      ))}
    </footer>
  );
}

function FooterIcon({ name }: { name: string }) {
  const common = "h-5 w-5 text-[#66717a]";

  if (name === "shipping") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  if (name === "returns") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20v-4.7h4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "secure") {
    return (
      <svg className={common} fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 14v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={common} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 13v-1a7 7 0 0 1 14 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 13h3v6H5zM16 13h3v6h-3zM16 19c0 1.2-1.1 2-2.4 2H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
