import StaffList from '../components/staff/StaffList'
import FeatureGate from '../components/common/FeatureGate'

export default function StaffPage() {
  return (
    <FeatureGate feature="featureStaff">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your gym staff members</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <StaffList />
        </div>
      </div>
    </FeatureGate>
  )
}
