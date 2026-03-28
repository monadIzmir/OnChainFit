// src/hooks/useApi.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiCall } from '../lib/api'
import { useAuth } from './useAuth'

type ApiResponse<T> = {
  success: boolean
  data: T
  meta?: {
    skip?: number
    take?: number
    total?: number
  }
}

export function useDesigns(skip = 0, take = 20) {
  const { token } = useAuth()
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['designs', skip, take],
    queryFn: async () => {
      return await apiCall<ApiResponse<any[]>>(`/designs?skip=${skip}&take=${take}`, {
        token: token ?? undefined,
      })
    },
  })
}

export function useProducts(skip = 0, take = 20) {
  const { token } = useAuth()
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['products', skip, take],
    queryFn: async () => {
      return await apiCall<ApiResponse<any[]>>(`/products?skip=${skip}&take=${take}`, {
        token: token ?? undefined,
      })
    },
  })
}

export function useMyDesigns(skip = 0, take = 20) {
  const { token } = useAuth()
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['myDesigns', skip, take],
    queryFn: async () => {
      return await apiCall<ApiResponse<any[]>>(`/designs/mine?skip=${skip}&take=${take}`, {
        token: token ?? undefined,
      })
    },
    enabled: !!token,
  })
}

export function useMyOrders(skip = 0, take = 10) {
  const { token } = useAuth()
  return useQuery<ApiResponse<any[]>>({
    queryKey: ['myOrders', skip, take],
    queryFn: async () => {
      return await apiCall<ApiResponse<any[]>>(`/orders/mine?skip=${skip}&take=${take}`, {
        token: token ?? undefined,
      })
    },
    enabled: !!token,
  })
}

export function useApi() {
  const { token } = useAuth()

  const createOrder = useMutation({
    mutationFn: async (data: any) => {
      return await apiCall('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
        token: token ?? undefined,
      })
    },
  })

  return {
    createOrder,
  }
}
