import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useStaffMember, useCreateStaff, useUpdateStaff } from '../hooks/useStaff'
import LoadingSpinner from '../components/common/LoadingSpinner'
import FeatureGate from '../components/common/FeatureGate'

const schema = z.object({
  name:           z.string().min(1, 'Name is required').max(150),
  phone:          z.string().max(30).optional().or(z.literal('')),
  email:          z.string().email('Invalid email').max(255).optional().or(z.literal('')),
  idProofType:    z.string().optional().or(z.literal('')),
  idProofNumber:  z.string().max(50).optional().or(z.literal('')),
  address:        z.string().optional().or(z.literal('')),
  salary:         z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
    z.number().positive('Salary must be positive').nullable().optional()
  ),
  role:    z.enum(['TRAINER', 'RECEPTIONIST', 'MANAGER', 'CLEANER', 'OTHER']),
  status:  z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']),
  joinDate: z.string().min(1, 'Join date is required'),
})

type FormData = z.infer<typeof schema>

export default function StaffFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const staffId = id ? parseInt(id) : 0

  const { data: staff, isLoading } = useStaffMember(staffId)
  const createStaff = useCreateStaff()
  const updateStaff = useUpdateStaff()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'ACTIVE', role: 'TRAINER', joinDate: new Date().toISOString().slice(0, 10) },
  })

  useEffect(() => {
    if (staff) {
      reset({
        name:          staff.name,
        phone:         staff.phone ?? '',
        email:         staff.email ?? '',
        idProofType:   staff.idProofType ?? '',
        idProofNumber: staff.idProofNumber ?? '',
        address:       staff.address ?? '',
        salary:        staff.salary ?? undefined,
        role:          staff.role,
        status:        staff.status,
        joinDate:      staff.joinDate,
      })
    }
  }, [staff, reset])

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      phone:         data.phone         || undefined,
      email:         data.email         || undefined,
      idProofType:   (data.idProofType  || undefined) as FormData['idProofType'],
      idProofNumber: data.idProofNumber || undefined,
      address:       data.address       || undefined,
    }
    if (isEdit) {
      await updateStaff.mutateAsync({ id: staffId, data: payload })
    } else {
      await createStaff.mutateAsync(payload)
    }
    navigate('/staff')
  }

  const inputCls = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
  const errCls   = 'text-xs text-red-500 mt-1'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  if (isEdit && isLoading) {
    return <div className="p-6 flex justify-center"><LoadingSpinner /></div>
  }

  const isPending = createStaff.isPending || updateStaff.isPending

  return (
    <FeatureGate feature="featureStaff">
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="mb-5">
        <button
          onClick={() => navigate('/staff')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Staff
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Staff Member' : 'Add Staff Member'}
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
          {isEdit ? 'Update staff details below' : 'Fill in the details to add a new staff member'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
              <input {...register('name')} className={inputCls} placeholder="e.g. Ravi Kumar" />
              {errors.name && <p className={errCls}>{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input {...register('phone')} className={inputCls} placeholder="+91-9876543210" />
              {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Email</label>
              <input {...register('email')} type="email" className={inputCls} placeholder="ravi@example.com" />
              {errors.email && <p className={errCls}>{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Join Date <span className="text-red-500">*</span></label>
              <input {...register('joinDate')} type="date" className={inputCls} />
              {errors.joinDate && <p className={errCls}>{errors.joinDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Role <span className="text-red-500">*</span></label>
              <select {...register('role')} className={inputCls}>
                <option value="TRAINER">Trainer</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="MANAGER">Manager</option>
                <option value="CLEANER">Cleaner</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.role && <p className={errCls}>{errors.role.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Status <span className="text-red-500">*</span></label>
              <select {...register('status')} className={inputCls}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
              {errors.status && <p className={errCls}>{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>ID Proof Type</label>
              <select {...register('idProofType')} className={inputCls}>
                <option value="">-- Select --</option>
                <option value="AADHAR">Aadhar</option>
                <option value="PAN">PAN</option>
                <option value="PASSPORT">Passport</option>
                <option value="DRIVING_LICENSE">Driving License</option>
                <option value="VOTER_ID">Voter ID</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>ID Proof Number</label>
              <input {...register('idProofNumber')} className={inputCls} placeholder="e.g. XXXX-XXXX-XXXX" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Salary (₹)</label>
            <input {...register('salary')} type="number" min="0" step="0.01" className={inputCls} placeholder="e.g. 25000" />
            {errors.salary && <p className={errCls}>{errors.salary.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Address</label>
            <textarea {...register('address')} rows={3} className={inputCls} placeholder="Full address..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/staff')}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {isPending ? 'Saving...' : isEdit ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </FeatureGate>
  )
}
