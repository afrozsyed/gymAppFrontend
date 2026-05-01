interface Props {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-3 mt-5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors text-gray-700 min-w-[90px]"
      >
        ← Previous
      </button>
      <span className="text-sm text-gray-500 font-medium">
        {page + 1} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors text-gray-700 min-w-[90px]"
      >
        Next →
      </button>
    </div>
  )
}
