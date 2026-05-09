import { useState } from 'react'
import { useMonthlyAttendance, useMarkAttendance } from '../../hooks/useStaff'
import type { Staff, AttendanceStatus, AttendanceRecord } from '../../types/staff.types'

interface Props {
  staff: Staff
  onClose: () => void
}

const STATUS_COLOR: Record<AttendanceStatus, string> = {
  PRESENT:  'bg-green-500',
  ABSENT:   'bg-red-500',
  HALF_DAY: 'bg-yellow-400',
  LEAVE:    'bg-blue-400',
}

const STATUS_TEXT_COLOR: Record<AttendanceStatus, string> = {
  PRESENT:  'text-green-700 bg-green-100',
  ABSENT:   'text-red-700   bg-red-100',
  HALF_DAY: 'text-yellow-700 bg-yellow-100',
  LEAVE:    'text-blue-700   bg-blue-100',
}

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT:  'Present',
  ABSENT:   'Absent',
  HALF_DAY: 'Half Day',
  LEAVE:    'Leave',
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AttendanceModal({ staff, onClose }: Props) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const [markDate,   setMarkDate]   = useState(today.toISOString().slice(0, 10))
  const [markStatus, setMarkStatus] = useState<AttendanceStatus>('PRESENT')
  const [markNotes,  setMarkNotes]  = useState('')

  const { data: records = [], isLoading } = useMonthlyAttendance(staff.id, year, month)
  const markAttendance = useMarkAttendance(staff.id, year, month)

  const recordMap: Record<string, AttendanceRecord> = {}
  records.forEach((r) => { recordMap[r.date] = r })

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (isCurrentMonth) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const monthLabel = new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  const daysInMonth   = new Date(year, month, 0).getDate()
  const firstWeekday  = new Date(year, month - 1, 1).getDay()

  const summary = { PRESENT: 0, ABSENT: 0, HALF_DAY: 0, LEAVE: 0 }
  records.forEach((r) => { summary[r.status]++ })

  const handleMark = async () => {
    await markAttendance.mutateAsync({ date: markDate, status: markStatus, notes: markNotes || undefined })
    setMarkNotes('')
  }

  const inputCls  = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white'
  const selectCls = inputCls + ' cursor-pointer'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">{staff.name}</h2>
            <p className="text-xs text-gray-500">Attendance</p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <button onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-800">{monthLabel}</span>
            <button onClick={nextMonth} disabled={isCurrentMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {(['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'] as AttendanceStatus[]).map((s) => (
              <div key={s} className={`rounded-xl py-2 px-1 text-xs font-semibold ${STATUS_TEXT_COLOR[s]}`}>
                <p className="text-lg font-bold">{summary[s]}</p>
                <p>{STATUS_LABELS[s]}</p>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {isLoading ? (
            <div className="py-4 text-center text-sm text-gray-400">Loading...</div>
          ) : (
            <div>
              <div className="grid grid-cols-7 mb-1">
                {DAY_HEADERS.map((d) => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells before first day */}
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const rec = recordMap[dateStr]
                  const isToday = dateStr === today.toISOString().slice(0, 10)
                  return (
                    <div key={day}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium
                        ${isToday ? 'ring-2 ring-blue-400' : ''}
                        ${rec ? STATUS_TEXT_COLOR[rec.status] : 'text-gray-400 bg-gray-50'}`}
                      title={rec ? STATUS_LABELS[rec.status] + (rec.notes ? `: ${rec.notes}` : '') : ''}
                    >
                      <span>{day}</span>
                      {rec && (
                        <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${STATUS_COLOR[rec.status]}`} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-3 justify-center">
                {(['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'] as AttendanceStatus[]).map((s) => (
                  <div key={s} className="flex items-center gap-1 text-xs text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[s]}`} />
                    {STATUS_LABELS[s]}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mark attendance */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Mark Attendance</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={markDate}
                  max={today.toISOString().slice(0, 10)}
                  onChange={(e) => setMarkDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={markStatus} onChange={(e) => setMarkStatus(e.target.value as AttendanceStatus)}
                  className={selectCls}>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
              <input
                value={markNotes}
                onChange={(e) => setMarkNotes(e.target.value)}
                placeholder="e.g. Sick leave"
                className={inputCls}
              />
            </div>
            <button
              onClick={handleMark}
              disabled={markAttendance.isPending}
              className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {markAttendance.isPending ? 'Saving...' : 'Mark Attendance'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
