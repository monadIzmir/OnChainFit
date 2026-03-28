// src/hooks/useApi.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiCall } from '../lib/api'
import { useAuth } from './useAuth'

export function useApi() {
  const { token } = useAuth()

  const get = useQuery.bind(null)
  const post = useMutation.bind(null)

  const fetchDesigns = (skip = 0, take = 20) =>
    useQuery({
      queryKey: ['designs', skip, take],
      queryFn: async () => {
        return await apiCall(`/designs?skip=${skip}&take=${take}`, { token })
      },
    })

  const fetchProducts = (skip = 0, take = 20) =>
    useQuery({
      queryKey: ['products', skip, take],
      queryFn: async () => {
        return await apiCall(`/products?skip=${skip}&take=${take}`, { token })
      },
    })

  const fetchMyDesigns = (skip = 0, take = 20) =>
    useQuery({
      queryKey: ['myDesigns', skip, take],
      queryFn: async () => {
        return await apiCall(`/designs/mine?skip=${skip}&take=${take}`, { token })
      },
      enabled: !!token,
    })

  const fetchMyOrders = (skip = 0, take = 10) =>
    useQuery({
      queryKey: ['myOrders', skip, take],
      queryFn: async () => {
        return await apiCall(`/orders/mine?skip=${skip}&take=${take}`, { token })
      },
      enabled: !!token,
    })

  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      return await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      })
    },
  })

  return {
    fetchDesigns,
    fetchProducts,
    fetchMyDesigns,
    fetchMyOrders,
    createOrder,
  }
}
