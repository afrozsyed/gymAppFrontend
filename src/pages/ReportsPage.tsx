import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMonthlyReport, useYearlyReport, useRangeReport } from '../hooks/useReport'
import { useAuthStore } from '../store/authStore'
import { useCurrentSubscription } from '../hooks/useSubscription'
import type { PlanStat, StaffAttendanceStat, MonthlyBreakdown } from '../types/report.types'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmt(amount: number) {
  return '₹ ' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function prevMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}

function nextMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function roleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase().replace(/_/g, ' ')
}

// ── shared sub-components ─────────────────────────────────────────────────────

interface CardProps {
  label: string
  value: string | number
  sub?: string
  accent?: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'gray'
}

function StatCard({ label, value, sub, accent }: CardProps) {
  const borderCls: Record<string, string> = {
    green: 'border-l-4 border-l-green-500',
    red: 'border-l-4 border-l-red-500',
    blue: 'border-l-4 border-l-blue-500',
    orange: 'border-l-4 border-l-orange-500',
    purple: 'border-l-4 border-l-purple-500',
    gray: 'border-l-4 border-l-gray-400',
  }
  const valueCls: Record<string, string> = {
    green: 'text-green-700',
    red: 'text-red-600',
    blue: 'text-blue-700',
    orange: 'text-orange-600',
    purple: 'text-purple-700',
    gray: 'text-gray-600',
  }
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${accent ? borderCls[accent] : ''}`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-bold ${accent ? valueCls[accent] : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{children}</h2>
  )
}

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 overflow-x-auto">
      {children}
    </div>
  )
}

function PlanTable({ rows }: { rows: PlanStat[] }) {
  if (!rows.length) {
    return <p className="text-sm text-gray-400 py-4 text-center">No payments recorded.</p>
  }
  const totalRenewals = rows.reduce((s, r) => s + r.renewalCount, 0)
  const totalRevenue  = rows.reduce((s, r) => s + Number(r.revenue), 0)
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
          <td className="pt-3 text-right font-bold text-gray-900">{totalRenewals}</td>
          <td className="pt-3 text-right font-bold text-green-700">{fmt(totalRevenue)}</td>
        </tr>
      </tfoot>
    </table>
  )
}

function StaffAttendanceTable({ rows }: { rows: StaffAttendanceStat[] }) {
  if (!rows.length) {
    return <p className="text-sm text-gray-400 py-4 text-center">No staff attendance data recorded.</p>
  }
  const totals = rows.reduce(
    (acc, r) => ({
      presentDays: acc.presentDays + r.presentDays,
      absentDays:  acc.absentDays  + r.absentDays,
      halfDays:    acc.halfDays    + r.halfDays,
      leaveDays:   acc.leaveDays   + r.leaveDays,
      totalMarked: acc.totalMarked + r.totalMarked,
    }),
    { presentDays: 0, absentDays: 0, halfDays: 0, leaveDays: 0, totalMarked: 0 }
  )
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
          <th className="pb-3 font-semibold">Staff</th>
          <th className="pb-3 font-semibold">Role</th>
          <th className="pb-3 text-center font-semibold text-green-600">Present</th>
          <th className="pb-3 text-center font-semibold text-red-500">Absent</th>
          <th className="pb-3 text-center font-semibold text-yellow-500">Half Day</th>
          <th className="pb-3 text-center font-semibold text-blue-500">Leave</th>
          <th className="pb-3 text-center font-semibold text-gray-500">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((r) => (
          <tr key={r.staffName} className="hover:bg-gray-50/60">
            <td className="py-3 font-medium text-gray-800">{r.staffName}</td>
            <td className="py-3 text-gray-500 text-xs">{roleLabel(r.role)}</td>
            <td className="py-3 text-center font-semibold text-green-700">{r.presentDays}</td>
            <td className="py-3 text-center font-semibold text-red-600">{r.absentDays}</td>
            <td className="py-3 text-center font-semibold text-yellow-600">{r.halfDays}</td>
            <td className="py-3 text-center font-semibold text-blue-600">{r.leaveDays}</td>
            <td className="py-3 text-center text-gray-600">{r.totalMarked}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t-2 border-gray-200">
        <tr>
          <td className="pt-3 font-bold text-gray-900" colSpan={2}>Total</td>
          <td className="pt-3 text-center font-bold text-green-700">{totals.presentDays}</td>
          <td className="pt-3 text-center font-bold text-red-600">{totals.absentDays}</td>
          <td className="pt-3 text-center font-bold text-yellow-600">{totals.halfDays}</td>
          <td className="pt-3 text-center font-bold text-blue-600">{totals.leaveDays}</td>
          <td className="pt-3 text-center font-bold text-gray-700">{totals.totalMarked}</td>
        </tr>
      </tfoot>
    </table>
  )
}

function MonthlyBreakdownTable({ rows }: { rows: MonthlyBreakdown[] }) {
  const totalJoiners  = rows.reduce((s, r) => s + r.newJoiners, 0)
  const totalRenewals = rows.reduce((s, r) => s + r.renewals, 0)
  const totalRevenue  = rows.reduce((s, r) => s + Number(r.revenue), 0)
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
          <th className="pb-3 font-semibold">Month</th>
          <th className="pb-3 text-right font-semibold">New Joiners</th>
          <th className="pb-3 text-right font-semibold">Renewals</th>
          <th className="pb-3 text-right font-semibold">Revenue</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((r) => (
          <tr key={r.month} className="hover:bg-gray-50/60">
            <td className="py-3 font-medium text-gray-800">{r.monthLabel}</td>
            <td className="py-3 text-right text-gray-600">{r.newJoiners}</td>
            <td className="py-3 text-right text-gray-600">{r.renewals}</td>
            <td className="py-3 text-right font-semibold text-gray-900">{fmt(r.revenue)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t-2 border-gray-200">
        <tr>
          <td className="pt-3 font-bold text-gray-900">Total</td>
          <td className="pt-3 text-right font-bold text-gray-900">{totalJoiners}</td>
          <td className="pt-3 text-right font-bold text-gray-900">{totalRenewals}</td>
          <td className="pt-3 text-right font-bold text-green-700">{fmt(totalRevenue)}</td>
        </tr>
      </tfoot>
    </table>
  )
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ErrorState() {
  return (
    <div className="text-center py-16 text-red-500 font-medium">
      Failed to load report. Please try again.
    </div>
  )
}

// ── tab: Monthly ──────────────────────────────────────────────────────────────

function MonthlyTab() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { data, isLoading, isError } = useMonthlyReport(year, month)
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  const handlePrev = () => { const p = prevMonth(year, month); setYear(p.year); setMonth(p.month) }
  const handleNext = () => { const n = nextMonth(year, month); setYear(n.year); setMonth(n.month) }

  return (
    <div className="space-y-6">
      {/* Navigator */}
      <div className="flex items-center justify-center gap-4 print:hidden">
        <button onClick={handlePrev} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" aria-label="Previous month">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-lg font-bold text-gray-900 min-w-[180px] text-center">
          {data?.monthLabel ?? `${year} / ${String(month).padStart(2, '0')}`}
        </span>
        <button onClick={handleNext} disabled={isCurrentMonth} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next month">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="hidden print:block text-center text-base font-semibold text-gray-600">{data?.monthLabel}</div>

      {isLoading && <LoadingSpinner />}
      {isError   && <ErrorState />}

      {data && (
        <>
          <section>
            <SectionHeading>Membership Overview</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Members"   value={data.totalMembers} />
              <StatCard label="Active Members"  value={data.activeMembers}  accent="green" />
              <StatCard label="Expired Members" value={data.expiredMembers} accent="red" />
              <StatCard label="New Joiners"     value={data.newJoinersThisMonth} accent="blue" sub="This month" />
            </div>
          </section>

          <section>
            <SectionHeading>Revenue — {data.monthLabel}</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard label="Revenue Collected"  value={fmt(data.revenueThisMonth)} accent="green"  sub="This month" />
              <StatCard label="Members Renewed"    value={data.renewedThisMonth}      accent="purple" sub="This month" />
              <StatCard label="Pending Amount"     value={fmt(data.pendingAmount)}    accent="orange" sub="All unpaid members" />
            </div>
          </section>

          <section>
            <SectionHeading>Plan-wise Revenue — {data.monthLabel}</SectionHeading>
            <TableCard><PlanTable rows={data.planBreakdown} /></TableCard>
          </section>

          <section>
            <SectionHeading>Staff Attendance — {data.monthLabel}</SectionHeading>
            <TableCard><StaffAttendanceTable rows={data.staffAttendance} /></TableCard>
          </section>
        </>
      )}
    </div>
  )
}

// ── tab: Yearly ───────────────────────────────────────────────────────────────

function YearlyTab() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const { data, isLoading, isError } = useYearlyReport(year)

  return (
    <div className="space-y-6">
      {/* Navigator */}
      <div className="flex items-center justify-center gap-4 print:hidden">
        <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" aria-label="Previous year">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-lg font-bold text-gray-900 min-w-[100px] text-center">{year}</span>
        <button onClick={() => setYear(y => y + 1)} disabled={year >= currentYear} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next year">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="hidden print:block text-center text-base font-semibold text-gray-600">Year {year}</div>

      {isLoading && <LoadingSpinner />}
      {isError   && <ErrorState />}

      {data && (
        <>
          <section>
            <SectionHeading>Membership Snapshot (Current)</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Members"   value={data.totalMembers} />
              <StatCard label="Active Members"  value={data.activeMembers}  accent="green" />
              <StatCard label="Expired Members" value={data.expiredMembers} accent="red" />
              <StatCard label="Pending Amount"  value={fmt(data.pendingAmount)} accent="orange" sub="All unpaid members" />
            </div>
          </section>

          <section>
            <SectionHeading>Year Totals — {year}</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard label="Total Revenue"    value={fmt(data.totalRevenue)}   accent="green" />
              <StatCard label="Total New Joiners" value={data.totalNewJoiners}   accent="blue" />
              <StatCard label="Total Renewals"   value={data.totalRenewals}       accent="purple" />
            </div>
          </section>

          <section>
            <SectionHeading>Month-by-Month Breakdown — {year}</SectionHeading>
            <TableCard><MonthlyBreakdownTable rows={data.monthlyBreakdown} /></TableCard>
          </section>

          <section>
            <SectionHeading>Plan-wise Revenue — {year}</SectionHeading>
            <TableCard><PlanTable rows={data.planBreakdown} /></TableCard>
          </section>

          <section>
            <SectionHeading>Staff Attendance — {year}</SectionHeading>
            <TableCard><StaffAttendanceTable rows={data.staffAttendance} /></TableCard>
          </section>
        </>
      )}
    </div>
  )
}

// ── tab: Custom ───────────────────────────────────────────────────────────────

function CustomTab() {
  const maxDate = today()
  const [start, setStart]     = useState('')
  const [end,   setEnd]       = useState('')
  const [enabled, setEnabled] = useState(false)

  const { data, isLoading, isError, isFetching } = useRangeReport(start, end, enabled)

  const handleGenerate = () => {
    if (start && end && start <= end) setEnabled(true)
  }

  const handleStartChange = (v: string) => { setStart(v); setEnabled(false) }
  const handleEndChange   = (v: string) => { setEnd(v);   setEnabled(false) }

  return (
    <div className="space-y-6">
      {/* Date pickers */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 print:hidden">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Start Date</label>
            <input
              type="date"
              max={maxDate}
              value={start}
              onChange={e => handleStartChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">End Date</label>
            <input
              type="date"
              max={maxDate}
              value={end}
              onChange={e => handleEndChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={!start || !end || start > end || isFetching}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isFetching ? 'Loading…' : 'Generate Report'}
          </button>
        </div>
        {start && end && start > end && (
          <p className="text-xs text-red-500 mt-2">End date must be on or after start date.</p>
        )}
      </div>

      {isLoading && <LoadingSpinner />}
      {isError   && <ErrorState />}

      {data && (
        <>
          <section>
            <SectionHeading>Membership Overview</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Members"   value={data.totalMembers} />
              <StatCard label="Active Members"  value={data.activeMembers}  accent="green" />
              <StatCard label="Expired Members" value={data.expiredMembers} accent="red" />
              <StatCard label="New Joiners"     value={data.newJoinersThisMonth} accent="blue" sub="In selected range" />
            </div>
          </section>

          <section>
            <SectionHeading>Revenue — {data.monthLabel}</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard label="Revenue Collected"  value={fmt(data.revenueThisMonth)} accent="green"  sub="In selected range" />
              <StatCard label="Members Renewed"    value={data.renewedThisMonth}      accent="purple" sub="In selected range" />
              <StatCard label="Pending Amount"     value={fmt(data.pendingAmount)}    accent="orange" sub="All unpaid members" />
            </div>
          </section>

          <section>
            <SectionHeading>Plan-wise Revenue — {data.monthLabel}</SectionHeading>
            <TableCard><PlanTable rows={data.planBreakdown} /></TableCard>
          </section>

          <section>
            <SectionHeading>Staff Attendance — {data.monthLabel}</SectionHeading>
            <TableCard><StaffAttendanceTable rows={data.staffAttendance} /></TableCard>
          </section>
        </>
      )}
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

type Tab = 'monthly' | 'yearly' | 'custom'

const TABS: { id: Tab; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly',  label: 'Yearly'  },
  { id: 'custom',  label: 'Custom'  },
]

function UpgradePrompt({ feature, planRequired }: { feature: string; planRequired: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl mb-3">🔒</div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">{feature}</h3>
      <p className="text-sm text-gray-500 mb-5">
        Upgrade to <span className="font-semibold text-blue-600">{planRequired}</span> to unlock this report.
      </p>
      <button
        onClick={() => navigate('/subscription')}
        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        View Plans
      </button>
    </div>
  )
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('monthly')
  const gymName = useAuthStore((s) => s.gymName)
  const { data: sub } = useCurrentSubscription()

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Membership, revenue & staff attendance</p>
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

      {/* Print-only header */}
      <div className="hidden print:block mb-6 border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Report</h1>
        {gymName && <p className="text-sm text-gray-500 mt-0.5">{gymName}</p>}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 print:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === t.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'monthly' && <MonthlyTab />}
      {activeTab === 'yearly'  && (
        sub?.featureReportsYearly
          ? <YearlyTab />
          : <UpgradePrompt feature="Yearly Reports" planRequired="Pro" />
      )}
      {activeTab === 'custom'  && (
        sub?.featureReportsCustom
          ? <CustomTab />
          : <UpgradePrompt feature="Custom Date Reports" planRequired="Pro Plus" />
      )}
    </div>
  )
}
