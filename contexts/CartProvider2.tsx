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
import { useRouter } from "next/navigation";

type CartContextType = {
  cart?: HttpTypes.StoreCart
  setCart: React.Dispatch<
    React.SetStateAction<HttpTypes.StoreCart | undefined>
  >
  refreshCart: () => void
  addToCart: (variant_id: string, quantity?: number) => void
  updateItemQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  transferCartForLoggedUser: () => void
  clearCart: () => void
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
    }).catch(err=>{
      alert("Could not update item quantity ")
    })
  }
  
   const removeItem = (itemId: string) => 
    {
      console.log('---------------------')
     console.log("itemId", itemId)
    const cartId = localStorage.getItem("cart_id")
      console.log('cartId', cartId)
    if (!cartId) {
      return
    }
  
    sdk.store.cart.deleteLineItem(cartId, itemId)
    .then(({ cart }) => {
      setCart(cart)
    })
  }

  const clearCart = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      return;
    }
    const cartId = localStorage.getItem("cart_id")
    if (!cartId) {
      return;
    }

    // Remove each item sequentially
    for (const item of cart.items) {
      await sdk.store.cart.deleteLineItem(cartId, item.id)
    }

    // Retrieve the updated cart
    sdk.store.cart.retrieve(cartId).then(({ cart: updatedCart }) => {
      setCart(updatedCart);
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
      transferCartForLoggedUser,
      clearCart,
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

// In your component
// import { useRouter } from "next/navigation";
// import { useCart } from "@/contexts/CartProvider2";

const CheckoutButton = () => {
  const router = useRouter();
  const { cart } = useCart();

  const goToCheckout = () => {
    if (!cart) return;
    router.push(`/checkout?cart_id=${cart.id}`);
  };

  return <button onClick={goToCheckout}>Checkout</button>;
};
