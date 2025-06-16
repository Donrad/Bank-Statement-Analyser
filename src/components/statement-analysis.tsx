import { BadgeAlert, BadgeCheck, CalendarIcon, ChevronLeft, ChevronRight, HouseIcon, PersonStandingIcon, ShieldX, UserIcon, Wallet } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

export interface Transaction {
  date: string;
  desc: string;
  amount: number;
}

export interface StatementDetails {
  name: string | null;
  address: string | null;
  date: string | null;
  startingBalance: number | null;
  endingBalance: number | null;
  transactions: Transaction[];
  reconciles: boolean | null;
  error?: string;
}

export function StatementAnalysis({ data }: { data: StatementDetails }) {
  const { name, address, date, startingBalance, endingBalance, transactions, reconciles } = data;

  // --- Search & Pagination State ---
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // --- Filtered and Paginated Transactions ---
  const filteredTransactions = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter(tx =>
      tx.date.toLowerCase().includes(term) ||
      tx.desc.toLowerCase().includes(term) ||
      tx.amount.toFixed(2).includes(term)
    );
  }, [search, transactions]);

  const pageCount = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = React.useMemo(
    () => filteredTransactions.slice((page - 1) * pageSize, page * pageSize),
    [filteredTransactions, page, pageSize]
  );

  React.useEffect(() => { setPage(1); }, [search, pageSize]);

  return (
    <div className="relative mt-8 p-6 bg-zinc-100/80 rounded-lg border border-sky-500 ring-2 ring-sky-300/40 backdrop-blur-lg overflow-hidden group transition-all duration-300 hover:shadow-[0_4px_32px_0_rgba(56,189,248,0.25)]">
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-sky-400/40 blur-xl opacity-60 group-hover:opacity-80 transition-all duration-300 z-0"></div>
      {/* Statement summary cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {/* Left: Name + Date stacked */}
        <div className="flex flex-col gap-2">
          {/* Name */}
          <div className="flex flex-col justify-center p-2 rounded-lg bg-white/80 border border-zinc-200 shadow-sm min-h-[40px]">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-sky-100 text-sky-600">
                <UserIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">Name</span>
            </div>
            <div className="text-xs font-bold text-zinc-900 truncate">{name || 'N/A'}</div>
          </div>
          {/* Date */}
          <div className="flex flex-col justify-center p-2 rounded-lg bg-white/80 border border-zinc-200 shadow-sm min-h-[40px]">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-sky-100 text-sky-600">
                <CalendarIcon className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">Date</span>
            </div>
            <div className="text-xs font-bold text-zinc-900 truncate">{date || 'N/A'}</div>
          </div>
        </div>

        <div className="flex flex-col items-start p-2 rounded-lg bg-white/80 border border-zinc-200 shadow-sm min-h-[40px] h-full">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-sky-100 text-sky-600">
              <HouseIcon className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">Address</span>
          </div>
          <div className="text-xs font-bold text-zinc-900 mt-0.5 pl-0">
            {address
              ? address.split(',').map((part, i) => (
                  <div key={i}>{part.trim()}</div>
                ))
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Balances summary cards */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-tr from-sky-50/80 to-zinc-50/80 border border-sky-200 shadow-sm">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-sky-200 text-sky-700">
            <Wallet className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Starting Balance</div>
            <div className="text-base font-bold text-zinc-900">{startingBalance !== null ? `$${startingBalance.toFixed(2)}` : 'N/A'}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-tr from-sky-50/80 to-zinc-50/80 border border-sky-200 shadow-sm">
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-sky-200 text-sky-700">
            <Wallet className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className="text-xs text-zinc-500 font-medium">Ending Balance</div>
            <div className="text-base font-bold text-zinc-900">{endingBalance !== null ? `$${endingBalance.toFixed(2)}` : 'N/A'}</div>
          </div>
        </div>
      </div>
      {reconciles !== null && (
        <div className={`relative z-10 flex items-center gap-2 p-2 rounded-lg shadow-sm border ${reconciles ? "bg-green-50/80 text-green-700 border-green-300" : "bg-red-50/80 text-red-700 border-red-300"} mt-2 mb-2`}>
          {reconciles ? (
            <>
              <BadgeCheck className="h-5 w-5 text-green-600" />
              <span className="font-medium">Balances Reconcile</span>
            </>
          ) : (
            <>
              <ShieldX className="h-5 w-5 text-red-600" />
              <span className="font-medium">Balances Do Not Reconcile</span>
            </>
          )}
        </div>
      )}
      {reconciles === null && startingBalance !== null && endingBalance !== null && (
        <div className="relative z-10 flex items-center gap-2 p-2 rounded-lg shadow-sm border bg-yellow-50/80 text-yellow-700 border-yellow-300 mt-2 mb-2">
          <BadgeAlert className="h-5 w-5 text-yellow-600" />
          <span className="font-medium">Reconciliation could not be confirmed.</span>
        </div>
      )}
      <h3 className="relative z-10 text-lg font-bold text-zinc-900 mt-8 mb-3 pt-4 border-t border-zinc-200 tracking-tight">Transactions</h3>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-2 mb-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search date, description, or amount..."
          className="w-full px-3 py-2 rounded-md border border-zinc-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 bg-white/80 text-zinc-800 placeholder-zinc-400 shadow-sm outline-none transition"
        />
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          className="px-2 py-2 rounded-md border border-zinc-300 bg-white/80 text-zinc-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 shadow-sm outline-none transition"
        >
          {[5, 10, 15, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      {filteredTransactions.length > 0 ? (
        <>
          <div className="relative z-10 overflow-x-auto rounded-xl shadow-inner border border-zinc-200/60 bg-white/80">
            <table className="min-w-full text-sm text-left text-zinc-700">
              <thead className="bg-sky-50 text-xs text-sky-800 uppercase">
                <tr>
                  <th scope="col" className="px-4 py-2">Date</th>
                  <th scope="col" className="px-4 py-2">Description</th>
                  <th scope="col" className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((tx, i) => (
                  <tr key={i + (page-1)*pageSize} className={`${i % 2 === 0 ? 'bg-white/90' : 'bg-zinc-50/80'} border-b border-zinc-100 hover:bg-sky-50/80 transition-all`}>
                    <td className="px-4 py-2 whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-2">{tx.desc}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}> 
                      {tx.amount < 0 ? `-$${Math.abs(tx.amount).toFixed(2)}` : `$${tx.amount.toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
            <span className="text-xs text-zinc-500">Page {page} of {pageCount}</span>
            <div className="flex gap-1">
              <Button
                className="px-2 py-1 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                type="button"
              >
                <ChevronLeft />
              </Button>
              {Array.from({length: pageCount}, (_, i) => i + 1).slice(Math.max(0, page-3), Math.min(pageCount, page+2)).map(pn => (
                <Button
                  key={pn}
                  className={`px-2 py-1 rounded-md border text-xs font-semibold transition-all ${pn === page ? 'bg-sky-600 text-white border-sky-600' : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-sky-50 hover:text-sky-700'}`}
                  onClick={() => setPage(pn)}
                  type="button"
                >{pn}</Button>
              ))}
              <Button
                className="px-2 py-1 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-sky-50 hover:text-sky-700 disabled:opacity-50"
                onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                type="button"
              >
                <ChevronRight />
              </Button>
            </div>
            <span className="text-xs text-zinc-400">{filteredTransactions.length} result{filteredTransactions.length !== 1 ? 's' : ''}</span>
          </div>
        </>
      ) : (
        <p className="relative z-10 text-zinc-400 italic">No transactions found or provided.</p>
      )}
    </div>
  );
}