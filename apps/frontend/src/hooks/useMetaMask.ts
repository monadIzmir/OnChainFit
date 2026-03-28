'use client'

import { useState, useCallback, useEffect } from 'react'

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}

const MONAD_TESTNET = {
  chainId: '0x279F', // 10143
  chainName: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
}

export function useMetaMask() {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isInstalled = typeof window !== 'undefined' && !!window.ethereum

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] ?? null)
    }
    const handleChainChanged = (id: string) => {
      setChainId(id)
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) setAccount(accounts[0])
    })
    window.ethereum.request({ method: 'eth_chainId' }).then(setChainId)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  const isOnMonadTestnet = chainId === MONAD_TESTNET.chainId

  const connect = useCallback(async (): Promise<string | null> => {
    if (!window.ethereum) {
      setError('MetaMask yüklü değil. Lütfen MetaMask eklentisini kurun.')
      return null
    }
    setIsConnecting(true)
    setError(null)
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
      return accounts[0]
    } catch (err: any) {
      setError(err.code === 4001 ? 'Bağlantı reddedildi.' : err.message)
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const switchToMonadTestnet = useCallback(async (): Promise<boolean> => {
    if (!window.ethereum) return false
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_TESTNET.chainId }],
      })
      return true
    } catch (err: any) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET],
          })
          return true
        } catch {
          setError('Monad Testnet ağı eklenemedi.')
          return false
        }
      }
      setError('Ağ değiştirilemedi.')
      return false
    }
  }, [])

  const sendTransaction = useCallback(
    async (to: string, amountMON: number): Promise<string | null> => {
      if (!window.ethereum || !account) return null
      const amountWei = BigInt(Math.round(amountMON * 1e18))
      const amountHex = '0x' + amountWei.toString(16)
      try {
        const txHash: string = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{ from: account, to, value: amountHex, gas: '0x5208' }],
        })
        return txHash
      } catch (err: any) {
        setError(err.code === 4001 ? 'İşlem reddedildi.' : err.message)
        return null
      }
    },
    [account]
  )

  return {
    account,
    isInstalled,
    isConnecting,
    isOnMonadTestnet,
    error,
    connect,
    switchToMonadTestnet,
    sendTransaction,
  }
}
