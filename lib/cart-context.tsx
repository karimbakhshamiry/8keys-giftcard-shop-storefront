'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export interface GiftCard {
  id: string
  name: string
  platform: string
  amount: number
  currency: string
  usdcPrice: string
  rating: number
  reviews: number
  discount: number
  popular: boolean
  color: string
  description: string
  external_id?: string
}

export interface CartItem extends GiftCard {
  quantity: number
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  totalUSDC: number
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: GiftCard }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
        )

        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + 1,
          totalAmount: state.totalAmount + action.payload.amount,
          totalUSDC: state.totalUSDC + parseFloat(action.payload.usdcPrice)
        }
      } else {
        const newItem: CartItem = { ...action.payload, quantity: 1 }
        return {
          ...state,
          items: [...state.items, newItem],
          totalItems: state.totalItems + 1,
          totalAmount: state.totalAmount + action.payload.amount,
          totalUSDC: state.totalUSDC + parseFloat(action.payload.usdcPrice)
        }
      }
    }

    case 'REMOVE_FROM_CART': {
      const itemToRemove = state.items.find((item) => item.id === action.payload)
      if (!itemToRemove) return state

      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalAmount: state.totalAmount - itemToRemove.amount * itemToRemove.quantity,
        totalUSDC: state.totalUSDC - parseFloat(itemToRemove.usdcPrice) * itemToRemove.quantity
      }
    }

    case 'UPDATE_QUANTITY': {
      const item = state.items.find((item) => item.id === action.payload.id)
      if (!item) return state

      const quantityDiff = action.payload.quantity - item.quantity

      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: action.payload.id })
      }

      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
      )

      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + quantityDiff,
        totalAmount: state.totalAmount + item.amount * quantityDiff,
        totalUSDC: state.totalUSDC + parseFloat(item.usdcPrice) * quantityDiff
      }
    }

    case 'CLEAR_CART': {
      return {
        items: [],
        totalItems: 0,
        totalAmount: 0,
        totalUSDC: 0
      }
    }

    case 'LOAD_CART': {
      return action.payload
    }

    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  totalUSDC: 0
}

interface CartContextType {
  state: CartState
  addToCart: (giftCard: GiftCard) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (id: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('gaming-giftcard-cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: cartData })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('gaming-giftcard-cart', JSON.stringify(state))
  }, [state])

  const addToCart = (giftCard: GiftCard) => {
    const existingItem = state.items.find((item) => item.id === giftCard.id)
    dispatch({ type: 'ADD_TO_CART', payload: giftCard })

    // Show toast after dispatch with improved styling
    if (existingItem) {
      toast.success(`Added another ${giftCard.name} to cart`, {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#00f5ff',
          border: '1px solid #7c3aed',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600'
        },
        iconTheme: {
          primary: '#00f5ff',
          secondary: '#1a1a2e'
        }
      })
    } else {
      toast.success(`🛒 ${giftCard.name} added to cart`, {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#00f5ff',
          border: '1px solid #7c3aed',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600'
        },
        iconTheme: {
          primary: '#00f5ff',
          secondary: '#1a1a2e'
        }
      })
    }
  }

  const removeFromCart = (id: string) => {
    const itemToRemove = state.items.find((item) => item.id === id)
    dispatch({ type: 'REMOVE_FROM_CART', payload: id })

    if (itemToRemove) {
      toast.success(`🗑️ ${itemToRemove.name} removed from cart`, {
        duration: 3000,
        style: {
          background: 'linear-gradient(135deg, #2e1a1a 0%, #3e1616 100%)',
          color: '#ff6b6b',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '600'
        },
        iconTheme: {
          primary: '#ff6b6b',
          secondary: '#2e1a1a'
        }
      })
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('🧹 Cart cleared', {
      duration: 3000,
      style: {
        background: 'linear-gradient(135deg, #1a2e1a 0%, #163e16 100%)',
        color: '#4ade80',
        border: '1px solid #22c55e',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '600'
      },
      iconTheme: {
        primary: '#4ade80',
        secondary: '#1a2e1a'
      }
    })
  }

  const getItemQuantity = (id: string): number => {
    const item = state.items.find((item) => item.id === id)
    console.log('-----------')
    console.log('item quanitty: ', item ? item.quantity : 'undefined')
    console.log('-----------')
    return item ? item.quantity : 0
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
