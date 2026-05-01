interface Props {
  label: string
  value: string | number
  icon: string
  color: 'red' | 'yellow' | 'blue' | 'green'
}

const colorMap = {
  red:    'bg-red-50    border-red-200    text-red-700',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  blue:   'bg-blue-50   border-blue-200   text-blue-700',
  green:  'bg-green-50  border-green-200  text-green-700',
}

const iconBg = {
  red:    'bg-red-100',
  yellow: 'bg-yellow-100',
  blue:   'bg-blue-100',
  green:  'bg-green-100',
}

export default function StatCard({ label, value, icon, color }: Props) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${colorMap[color]}`}>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl mb-3 ${iconBg[color]}`}>
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-xs sm:text-sm font-medium mt-1 opacity-70 leading-snug">{label}</div>
    </div>
  )
}
