import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader, { IconButton } from '../components/layout/PageHeader'
import DaySheet from '../components/calendar/DaySheet'
import { useCalendar } from '../hooks/useCalendar'
import { useItems } from '../hooks/useItems'
import { useToast } from '../contexts/ToastContext'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Cells in the grid: null = empty padding before month starts
function buildCalendarDays(year: number, month: number): Array<Date | null> {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay() // 0=Sun
  const days: Array<Date | null> = []
  for (let i = 0; i < startPad; i++) days.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d))
  // Pad to complete the last week row
  while (days.length % 7 !== 0) days.push(null)
  return days
}

const TODAY_STR = toISODate(new Date())

export default function CalendarPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const { items } = useItems()
  const { entries, loading, planForDate, removeEntry, updateStatus } = useCalendar(year, month)

  const days = buildCalendarDays(year, month)
  const entryByDate = new Map(entries.map((e) => [e.date, e]))
  const selectedEntry = selectedDate ? (entryByDate.get(selectedDate) ?? null) : null

  function prevMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  function goToToday() {
    const today = new Date()
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(TODAY_STR)
  }

  async function handlePlan(outfitId: string, status: 'planned' | 'worn') {
    if (!selectedDate) return
    const { error } = await planForDate(selectedDate, outfitId, status)
    if (error) showToast("Totally buggin' — couldn't save", 'error')
  }

  async function handleRemove() {
    if (!selectedEntry) return
    const { error } = await removeEntry(selectedEntry.id)
    if (error) showToast("Totally buggin' — couldn't remove", 'error')
  }

  async function handleToggleStatus(status: 'planned' | 'worn') {
    if (!selectedEntry) return
    const { error } = await updateStatus(selectedEntry.id, status)
    if (error) showToast("Couldn't update status", 'error')
  }

  const wornCount = entries.filter((e) => e.status === 'worn').length
  const plannedCount = entries.filter((e) => e.status === 'planned').length

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        left={
          <IconButton label="Go back to home" onClick={() => navigate('/home')}>
            <BackIcon />
          </IconButton>
        }
        right={
          <IconButton label="Jump to today" onClick={goToToday}>
            <TodayIcon />
          </IconButton>
        }
      />

      {/* Scrollable body — no tab bar, so smaller bottom padding */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}
      >
        {/* Month navigator */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <button
            onClick={prevMonth}
            className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-text-secondary active:bg-neutral-200 transition-colors"
            aria-label="Previous month"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M11 4L7 9l4 5" />
            </svg>
          </button>

          <div className="text-center">
            <p className="text-lg font-bold text-text-primary leading-none">
              {MONTH_NAMES[month]}
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">{year}</p>
          </div>

          <button
            onClick={nextMonth}
            className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-text-secondary active:bg-neutral-200 transition-colors"
            aria-label="Next month"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M7 4l4 5-4 5" />
            </svg>
          </button>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 px-2">
          {DAY_LABELS.map((label) => (
            <div key={label} className="text-center py-2">
              <span className="text-xs font-semibold text-text-tertiary">{label}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 px-2 gap-y-0.5">
          {days.map((day, i) => {
            if (!day) {
              return <div key={`pad-${i}`} className="h-12" />
            }

            const dateStr = toISODate(day)
            const entry = entryByDate.get(dateStr) ?? null
            const isToday = dateStr === TODAY_STR
            const isSelected = dateStr === selectedDate

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`
                  flex flex-col items-center py-1 rounded-xl transition-all duration-100 active:scale-95
                  ${isSelected && !isToday ? 'bg-neutral-100' : ''}
                `}
              >
                {/* Date number */}
                <div
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-full
                    text-sm font-${isToday ? 'bold' : 'medium'}
                    ${isToday
                      ? 'bg-accent-yellow text-text-primary'
                      : 'text-text-primary'
                    }
                  `}
                >
                  {day.getDate()}
                </div>

                {/* Status dot */}
                <div className="h-1.5 mt-0.5 flex items-center justify-center">
                  {entry ? (
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        entry.status === 'worn' ? 'bg-emerald-500' : 'bg-accent-yellow'
                      }`}
                    />
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 px-6 pt-5 pb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-yellow" />
            <span className="text-xs text-text-tertiary">Planned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-text-tertiary">Worn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-4 flex items-center justify-center rounded-full bg-accent-yellow`}>
              <span className="text-2xs font-bold">14</span>
            </div>
            <span className="text-xs text-text-tertiary">Today</span>
          </div>
        </div>

        {/* Month stats card */}
        {!loading && (wornCount > 0 || plannedCount > 0) && (
          <div className="mx-4 mt-4 p-4 bg-white rounded-2xl shadow-card">
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
              {MONTH_NAMES[month]} overview
            </p>
            <div className="flex gap-6">
              {wornCount > 0 && (
                <div>
                  <p className="text-2xl font-bold text-emerald-600 leading-none">{wornCount}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {wornCount === 1 ? 'outfit worn' : 'outfits worn'}
                  </p>
                </div>
              )}
              {plannedCount > 0 && (
                <div>
                  <p className="text-2xl font-bold text-neutral-800 leading-none">{plannedCount}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {plannedCount === 1 ? 'outfit planned' : 'outfits planned'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading shimmer */}
        {loading && (
          <div className="flex justify-center pt-4">
            <div className="w-6 h-6 rounded-full border-2 border-accent-yellow border-t-transparent animate-spin" />
          </div>
        )}
      </div>

      <DaySheet
        open={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        date={selectedDate}
        entry={selectedEntry}
        items={items}
        onPlan={handlePlan}
        onRemove={handleRemove}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M14 5L8 11l6 6" />
    </svg>
  )
}

function TodayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="16" height="16" rx="3" />
      <path d="M16 2v4M6 2v4M3 10h16" />
      <circle cx="11" cy="15" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
