import PlanList from '../components/plans/PlanList'

export default function PlansPage() {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Plans</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage your membership plans</p>
      </div>
      <PlanList />
    </div>
  )
}
