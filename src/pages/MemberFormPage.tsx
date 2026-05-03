import { useNavigate, useParams } from 'react-router-dom'
import MemberForm, { type MemberFormData } from '../components/members/MemberForm'
import { useCreateMember, useUpdateMember, useMember } from '../hooks/useMembers'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function MemberFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const memberId = id ? parseInt(id) : 0

  const { data: member, isLoading } = useMember(memberId)
  const createMember = useCreateMember()
  const updateMember = useUpdateMember()

  const handleSubmit = async (data: MemberFormData) => {
    if (isEdit && member) {
      await updateMember.mutateAsync({ id: memberId, data })
    } else {
      await createMember.mutateAsync(data)
    }
    navigate('/members')
  }

  if (isEdit && isLoading) {
    return <div className="p-6 flex justify-center"><LoadingSpinner /></div>
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <div className="mb-5 sm:mb-6">
        <button
          onClick={() => navigate('/members')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Members
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Member' : 'Add Member'}
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
          {isEdit ? 'Update member details below' : 'Fill in the details to add a new member'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <MemberForm
          defaultValues={isEdit ? member : undefined}
          onSubmit={handleSubmit}
          isLoading={createMember.isPending || updateMember.isPending}
        />
      </div>
    </div>
  )
}
