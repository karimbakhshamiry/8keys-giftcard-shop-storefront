"use client" // include with Next.js 13+

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState,
} from "react"
import { HttpTypes } from "@medusajs/types"
import { useRegion } from "@/contexts/RegionProvider"
import { sdk } from "@/lib/sdk"

type CartContextType = {
  cart?: HttpTypes.StoreCart
  setCart: React.Dispatch<
    React.SetStateAction<HttpTypes.StoreCart | undefined>
  >
  refreshCart: () => void
  addToCart: (variant_id: string, quantity?: number) => void
  updateItemQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void,
  transferCartForLoggedUser: () => void
}

const CartContext = createContext<CartContextType | null>(null)

type CartProviderProps = {
  children: React.ReactNode
}

export const CartProvider2 = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<
    HttpTypes.StoreCart
  >()
  const { region } = useRegion()

  useEffect(() => {
    if (cart || !region) {
      return
    }

    const cartId = localStorage.getItem("cart_id")
    if (!cartId) {
      // create a cart
      sdk.store.cart.create({
        region_id: region.id,
      })
      .then(({ cart: dataCart }) => {
        localStorage.setItem("cart_id", dataCart.id)
        setCart(dataCart)
      })
    } else {
      // retrieve cart
      sdk.store.cart.retrieve(cartId)
      .then(({ cart: dataCart }) => {
        setCart(dataCart)
      })
    }
  }, [cart, region])

  const refreshCart = () => {
    localStorage.removeItem("cart_id")
    setCart(undefined)
  }

  const addToCart = (variant_id: string, quantity?: number) => {
    const cartId = localStorage.getItem("cart_id")
  
    if (!cartId) {
      return
    }
  
    sdk.store.cart.createLineItem(cartId, {
      variant_id,
      quantity: quantity || 1,
    })
    .then(({ cart }) => {
      // use cart
      console.log(cart)
      setCart(cart)
      alert("Product added to cart")
    })
  }

  const transferCartForLoggedUser = () => {
    const cartId = localStorage.getItem("cart_id")
  
    if (!cartId) {
      return
    }

    sdk.store.cart.transferCart(cartId)
    .then(({ cart }) => {
      // use cart...
      setCart(cart)
    })
  }
  
   const updateItemQuantity = (
    itemId: string,
    quantity: number
  ) => {
    const cartId = localStorage.getItem("cart_id")
  
    if (!cartId) {
      return
    }
  
    sdk.store.cart.updateLineItem(cartId, itemId, {
      quantity,
    })
    .then(({ cart }) => {
      // use cart
      console.log(cart)
      setCart(cart)
    })
  }
  
   const removeItem = (itemId: string) => {
    const cartId = localStorage.getItem("cart_id")
  
    if (!cartId) {
      return
    }
  
    sdk.store.cart.deleteLineItem(cartId, itemId)
    .then(({ parent: cart }) => {
      // use cart
      console.log(cart)
      setCart(cart)
    })
  }

  return (
    <CartContext.Provider value={{
      cart,
      setCart,
      refreshCart,
      addToCart,
      removeItem,
      updateItemQuantity,
      transferCartForLoggedUser
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}
