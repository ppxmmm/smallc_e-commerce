"use client";

type ProductSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ProductSearchBar({ value, onChange, className = "" }: ProductSearchBarProps) {
  return (
    <label
      className={`flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-500 shadow-sm focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 ${className}`}
    >
      <SearchIcon />
      <span className="sr-only">Search for products</span>
      <input
        aria-label="Search for products"
        className="w-full text-slate-900 outline-none placeholder:text-slate-400"
        data-testid="global-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search for products..."
        type="search"
        value={value}
      />
    </label>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4 shrink-0 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}
