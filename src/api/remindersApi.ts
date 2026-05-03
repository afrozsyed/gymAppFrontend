import axiosInstance from './axiosInstance'

export const remindersApi = {
  send: (memberId: number) =>
    axiosInstance.post(`/reminders/send/${memberId}`).then((r) => r.data),
}
