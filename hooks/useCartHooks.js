import { useState, useEffect, useCallback } from "react"
import { sdk } from "@/lib/sdk"

export const useCart = () => {
  const [cart, setCart] = useState(null)

  // Create a new cart
  const createCart = useCallback(async (options = {}) => {
    try {
      const { cart } = await sdk.store.cart.create(options)
      localStorage.setItem("cart_id", cart.id)
      // setCart(cart)
      return cart
    } catch (error) {
      console.error("Error creating cart:", error)
    }
  }, [])

  // Retrieve an existing cart by ID
  const retrieveCart = useCallback(async (id) => {
    if (!id) return null
    try {
      const { cart } = await sdk.store.cart.retrieve(id)
      setCart(cart)
      return cart
    } catch (error) {
      console.error("Error retrieving cart:", error)
    }
  }, [])

  // Update cart properties
  const updateCart = useCallback(async (cartId, update) => {
    try {
      const { cart } = await sdk.store.cart.update(cartId, update)
      setCart(cart)
      return cart
    } catch (error) {
      console.error("Error updating cart:", error)
    }
  }, [])

  // Line item operations
  const addLineItem = useCallback(async (cartId, item) => {
    try {
      const { cart } = await sdk.store.cart.lineItems.create(cartId, item)
      setCart(cart)
      return cart
    } catch (error) {
      console.error("Error adding line item:", error)
    }
  }, [])

  const updateLineItem = useCallback(async (cartId, lineItemId, item) => {
    try {
      const { cart } = await sdk.store.cart.lineItems.update(cartId, lineItemId, item)
      setCart(cart)
      return cart
    } catch (error) {
      console.error("Error updating line item:", error)
    }
  }, [])

  const deleteLineItem = useCallback(async (cartId, lineItemId) => {
    try {
      const { cart } = await sdk.store.cart.lineItems.delete(cartId, lineItemId)
      setCart(cart)
      return cart
    } catch (error) {
      console.error("Error deleting line item:", error)
    }
  }, [])

  // Initialize cart on mount if ID exists
  useEffect(() => {
    const id = localStorage.getItem("cart_id")
    if (id) {
      retrieveCart(id)
    }
  }, [retrieveCart])

  return {
    cart,
    setCart,
    createCart,
    retrieveCart,
    updateCart,
    addLineItem,
    updateLineItem,
    deleteLineItem,
  }
}
