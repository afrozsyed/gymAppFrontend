export interface Plan {
  id: number
  name: string
  durationDays: number
  price: number
}

export interface PlanRequest {
  name: string
  durationDays: number
  price: number
}
