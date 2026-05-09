import { useState } from 'react'
import { useMonthlyReport } from '../hooks/useReport'
import { useAuthStore } from '../store/authStore'
import type { PlanStat } from '../types/report.types'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return '₹ ' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function prevMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}

function nextMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
}

// ── sub-components ────────────────────────────────────────────────────────────

interface CardProps {
  label: string
  value: string | number
  sub?: string
  accent?: 'green' | 'red' | 'blue' | 'orange' | 'purple'
}

function StatCard({ label, value, sub, accent }: CardProps) {
  const accentCls = {
    green:  'border-l-4 border-l-green-500',
    red:    'border-l-4 border-l-red-500',
    blue:   'border-l-4 border-l-blue-500',
    orange: 'border-l-4 border-l-orange-500',
    purple: 'border-l-4 border-l-purple-500',
  }
  const valueCls = {
    green:  'text-green-700',
    red:    'text-red-600',
    blue:   'text-blue-700',
    orange: 'text-orange-600',
    purple: 'text-purple-700',
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${accent ? accentCls[accent] : ''}`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-bold ${accent ? valueCls[accent] : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function PlanTable({ rows }: { rows: PlanStat[] }) {
  if (!rows.length) {
    return <p className="text-sm text-gray-400 py-4 text-center">No payments recorded this month.</p>
  }
  const total = rows.reduce((s, r) => s + Number(r.revenue), 0)
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
          <th className="pb-3 font-semibold">Plan</th>
          <th className="pb-3 font-semibold text-right">Renewals</th>
          <th className="pb-3 font-semibold text-right">Revenue</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((r) => (
          <tr key={r.planName} className="hover:bg-gray-50/60">
            <td className="py-3 font-medium text-gray-800">{r.planName}</td>
            <td className="py-3 text-right text-gray-600">{r.renewalCount}</td>
            <td className="py-3 text-right font-semibold text-gray-900">{fmt(r.revenue)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t-2 border-gray-200">
        <tr>
          <td className="pt-3 font-bold text-gray-900">Total</td>
          <td className="pt-3 text-right font-bold text-gray-900">
            {rows.reduce((s, r) => s + r.renewalCount, 0)}
          </td>
          <td className="pt-3 text-right font-bold text-green-700">{fmt(total)}</td>
        </tr>
      </tfoot>
    </table>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const { data, isLoading, isError } = useMonthlyReport(year, month)
  const gymName = useAuthStore((s) => s.gymName)

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  const handlePrev = () => { const p = prevMonth(year, month); setYear(p.year); setMonth(p.month) }
  const handleNext = () => { const n = nextMonth(year, month); setYear(n.year); setMonth(n.month) }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">

      {/* ── Page header (hidden when printing) ── */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monthly membership &amp; revenue summary</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print / Save PDF
        </button>
      </div>

      {/* ── Print-only header ── */}
      <div className="hidden print:block mb-6 border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Monthly Report — {data?.monthLabel ?? ''}</h1>
        {gymName && <p className="text-sm text-gray-500 mt-0.5">{gymName}</p>}
      </div>

      {/* ── Month navigator (hidden when printing) ── */}
      <div className="flex items-center justify-center gap-4 mb-7 print:hidden">
        <button
          onClick={handlePrev}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-lg font-bold text-gray-900 min-w-[160px] text-center">
          {data?.monthLabel ?? `${year} / ${String(month).padStart(2, '0')}`}
        </span>
        <button
          onClick={handleNext}
          disabled={isCurrentMonth}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Print-only month label ── */}
      <div className="hidden print:block text-center text-base font-semibold text-gray-600 mb-6">
        {data?.monthLabel}
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <div className="text-center py-16 text-red-500 font-medium">
          Failed to load report. Please try again.
        </div>
      )}

      {data && (
        <div className="space-y-6">

          {/* ── Section: Membership Overview ── */}
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Membership Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Members"  value={data.totalMembers} />
              <StatCard label="Active Members" value={data.activeMembers} accent="green" />
              <StatCard label="Expired Members" value={data.expiredMembers} accent="red" />
              <StatCard
                label="New Joiners"
                value={data.newJoinersThisMonth}
                accent="blue"
                sub="This month"
              />
            </div>
          </section>

          {/* ── Section: Revenue ── */}
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Revenue — {data.monthLabel}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard
                label="Revenue Collected"
                value={fmt(data.revenueThisMonth)}
                accent="green"
                sub="This month"
              />
              <StatCard
                label="Members Renewed"
                value={data.renewedThisMonth}
                accent="purple"
                sub="This month"
              />
              <StatCard
                label="Pending Amount"
                value={fmt(data.pendingAmount)}
                accent="orange"
                sub="All unpaid members"
              />
            </div>
          </section>

          {/* ── Section: Plan Breakdown ── */}
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Plan-wise Revenue — {data.monthLabel}
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <PlanTable rows={data.planBreakdown} />
            </div>
          </section>

        </div>
      )}
    </div>
  )
}
