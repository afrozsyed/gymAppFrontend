import MemberList from '../components/members/MemberList'

export default function MembersPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Members</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Manage your gym members</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <MemberList />
      </div>
    </div>
  )
}
