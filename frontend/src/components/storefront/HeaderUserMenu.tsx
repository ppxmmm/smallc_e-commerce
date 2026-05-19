"use client";

import { getInitials } from "@/lib/displayName.mjs";

type HeaderUserMenuProps = {
  displayName: string;
  onSignOut: () => void;
};

export function HeaderUserMenu({ displayName, onSignOut }: HeaderUserMenuProps) {
  const initials = getInitials(displayName);

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-slate-200 bg-gradient-to-r from-slate-50 to-white py-1 pl-1 pr-1.5 shadow-sm"
      data-testid="header-user-menu"
    >
      <div
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold tracking-tight text-white shadow-inner ring-2 ring-white"
      >
        {initials}
      </div>

      <div className="min-w-0 max-w-[9rem] px-2 sm:max-w-none">
        <p className="hidden truncate text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:block">
          Welcome
        </p>
        <p className="truncate text-sm font-semibold leading-tight text-slate-900">
          Hi, {displayName}
        </p>
      </div>

      <span aria-hidden="true" className="mx-0.5 h-7 w-px bg-slate-200" />

      <button
        aria-label="Sign out"
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-800 sm:px-3"
        onClick={onSignOut}
        type="button"
      >
        <SignOutIcon />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </div>
  );
}

function SignOutIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
