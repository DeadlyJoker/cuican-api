import React, { useState } from 'react'
import type { UnifiedOrder } from '../types'

type OrdersDialogType = 'complete' | null

type OrdersContextType = {
  open: OrdersDialogType
  setOpen: (str: OrdersDialogType) => void
  currentRow: UnifiedOrder | null
  setCurrentRow: React.Dispatch<React.SetStateAction<UnifiedOrder | null>>
  refreshTrigger: number
  triggerRefresh: () => void
}

const OrdersContext = React.createContext<OrdersContextType | null>(null)

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<OrdersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<UnifiedOrder | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1)

  return (
    <OrdersContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </OrdersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => {
  const ordersContext = React.useContext(OrdersContext)

  if (!ordersContext) {
    throw new Error('useOrders has to be used within <OrdersProvider>')
  }

  return ordersContext
}
