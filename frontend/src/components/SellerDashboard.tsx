"use client";

type SellerDashboardProps = {
  userEmail?: string;
  onSignOut: () => void;
};

const orderRows = [
  ["SC250517-0036", "Somchai C.", "Paid", "Processing", "฿3,040"],
  ["SC250517-0005", "Nattaporn R.", "Paid", "Packed", "฿1,290"],
  ["SC250509-0064", "Worawut K.", "Paid", "Delivered", "฿3,590"],
  ["SC250426-0011", "May P.", "Refunded", "Returned", "฿1,090"],
];

const productRows = [
  ["Soundcore Life Q30", "Electronics", "24", "Edit"],
  ["Uniqlo U Crew Neck T-Shirt", "Fashion", "58", "Edit"],
  ["The Ordinary Niacinamide 10%", "Beauty", "32", "Edit"],
  ["Baseus 100W GaN Charger", "Accessories", "18", "Edit"],
];

const navItems = ["Dashboard", "Orders", "Products", "Inventory", "Reports"];

export function SellerDashboard({ userEmail, onSignOut }: SellerDashboardProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <a className="text-3xl font-black" href="#seller-dashboard">
            small<span className="text-emerald-600">C</span>
          </a>
          <p className="mt-1 text-sm text-slate-500">Seller workspace</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {userEmail ? <span className="text-slate-600">Signed in as {userEmail}</span> : null}
          <button
            className="font-bold text-emerald-700 hover:text-emerald-900"
            onClick={onSignOut}
            type="button"
          >
            Sign out
          </button>
        </div>
      </header>

      <section
        id="seller-dashboard"
        className="m-3 grid grid-cols-[180px_1fr] overflow-hidden rounded-lg border border-slate-200 bg-white max-lg:grid-cols-1"
      >
        <aside className="grid content-start gap-2 border-r border-slate-200 bg-slate-50 p-5">
          <strong>Seller Dashboard</strong>
          {navItems.map((item, index) => (
            <a
              className={`rounded-lg px-3 py-2 font-semibold ${index === 0 ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white"}`}
              href="#seller-dashboard"
              key={item}
            >
              {item}
            </a>
          ))}
        </aside>

        <div className="p-5">
          <h1 className="text-2xl font-black">Dashboard Overview</h1>
          <p className="mt-1 text-slate-500">Manage your products and fulfill customer orders.</p>

          <div className="my-5 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
            {[
              ["Total Revenue", "฿125,430", "+18.4%"],
              ["Orders", "1,234", "+12.4%"],
              ["Products", "48", "+4.2%"],
              ["Avg. Order Value", "฿1,016", "+5.3%"],
            ].map(([label, value, delta]) => (
              <article className="rounded-lg border border-slate-200 p-4" key={label}>
                <p className="text-sm text-slate-500">{label}</p>
                <strong className="mt-2 block text-2xl">{value}</strong>
                <span className="text-sm font-bold text-emerald-700">{delta}</span>
              </article>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 max-lg:grid-cols-1">
            <article className="rounded-lg border border-slate-200 p-5">
              <h2 className="font-black">Revenue Over Time</h2>
              <div className="mt-4 h-36 rounded-lg bg-[linear-gradient(145deg,transparent_48%,#10964f_49%_51%,transparent_52%),repeating-linear-gradient(to_top,#fff_0_34px,#edf2f7_35px_36px)]" />
            </article>
            <article className="rounded-lg border border-slate-200 p-5">
              <h2 className="font-black">Recent Orders</h2>
              <Table
                headers={["Order", "Customer", "Status"]}
                rows={orderRows.map((row) => [row[0], row[1], row[3]])}
              />
            </article>
            <article className="rounded-lg border border-slate-200 p-5">
              <h2 className="font-black">Product Management</h2>
              <Table
                headers={["Product", "Category", "Stock", "Action"]}
                rows={productRows}
              />
            </article>
            <article className="rounded-lg border border-slate-200 p-5">
              <h2 className="font-black">Order Management</h2>
              <Table
                headers={["Order", "Payment", "Fulfillment", "Action"]}
                rows={orderRows.map((row) => [row[0], row[2], row[3], "Ship"])}
              />
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                className="border-b border-slate-200 px-3 py-2 text-left text-slate-500"
                key={header}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell) => (
                <td className="border-b border-slate-100 px-3 py-2" key={cell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
