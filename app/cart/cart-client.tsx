'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import Loading, { Spinner } from '../../components/Loading'
import { useCart } from '../../lib/cart-context'
import { useAuth } from '../../lib/auth-context'
import {
  Gift,
  Shield,
  Clock,
  ArrowLeft,
  ArrowRight,
  Bitcoin,
  Wallet,
  Check,
  Copy,
  ExternalLink,
  ShoppingCart,
  Coins,
  AlertCircle,
  Eye,
  EyeOff,
  CreditCard,
  Zap,
  Plus,
  Minus,
  Trash2
} from '../../components/icons'

export default function CartClient() {
  const router = useRouter()
  const { state: cartState, updateQuantity, removeFromCart, clearCart } = useCart()
  const { customer } = useAuth()

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleIncreaseQuantity = (id: string, currentQuantity: number) => {
    updateQuantity(id, currentQuantity + 1)
  }

  const handleDecreaseQuantity = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(id, currentQuantity - 1)
    } else {
      removeFromCart(id)
    }
  }

  if (isLoading) {
    return <Loading />
  }

  if (cartState.items.length === 0) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gaming-dark via-gaming-purple to-gaming-dark'>
        <Navigation />
        <div className='flex items-center justify-center min-h-[60vh]'>
          <div className='text-center'>
            <ShoppingCart className='w-16 h-16 mx-auto mb-4 text-gaming-neon' />
            <h2 className='text-2xl font-gaming font-bold text-white mb-2'>Your Cart is Empty</h2>
            <p className='text-gray-400 mb-6'>Add some gaming gift cards to get started!</p>
            <button onClick={() => router.push('/gift-cards')} className='btn-neon'>
              <Gift className='w-5 h-5 mr-2' />
              Browse Gift Cards
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gaming-dark via-gaming-purple to-gaming-dark'>
      <Navigation />

      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-6xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl md:text-6xl font-gaming font-bold mb-4'>
              <span className='text-white'>Shopping</span>
              <span className='cyber-text'> Cart</span>
            </h1>
            <p className='text-xl max-w-2xl mx-auto text-gray-300'>
              Review your gift card selection and proceed to checkout
            </p>
          </div>

          <div className='grid lg:grid-cols-[1fr_400px] gap-8'>
            {/* Cart Items */}
            <div className='gaming-card'>
              <h2 className='text-2xl font-gaming font-bold text-white mb-6'>Cart Items</h2>

              <div className='space-y-4'>
                {cartState.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='flex items-center justify-between p-4 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50'
                  >
                    <div className='flex items-center space-x-4'>
                      <div className='w-16 h-16 bg-gaming-gold/20 rounded-lg flex items-center justify-center'>
                        <Gift className='w-8 h-8 text-gaming-gold' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-white'>{item.name}</h3>
                        <p className='text-sm text-gray-400'>{item.platform}</p>
                        <div className='text-sm text-gaming-cyan'>{item.usdcPrice} USDC</div>
                      </div>
                    </div>

                    <div className='flex items-center space-x-4'>
                      {/* Quantity Controls */}
                      <div className='flex items-center space-x-2'>
                        <button
                          onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                          className='w-8 h-8 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50 text-gaming-cyan hover:bg-gaming-cyan/20 transition-colors flex items-center justify-center'
                        >
                          <Minus className='w-4 h-4' />
                        </button>
                        <span className='text-white font-semibold min-w-[2rem] text-center'>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                          className='w-8 h-8 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50 text-gaming-cyan hover:bg-gaming-cyan/20 transition-colors flex items-center justify-center'
                        >
                          <Plus className='w-4 h-4' />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className='text-right'>
                        <div className='font-bold text-gaming-neon'>
                          ${(item.amount * item.quantity).toFixed(2)}
                        </div>
                        <div className='text-sm text-gray-400'>
                          {(parseFloat(item.usdcPrice) * item.quantity).toFixed(6)} USDC
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className='p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Clear Cart Button */}
              {cartState.items.length > 0 && (
                <div className='mt-6 flex justify-end'>
                  <button onClick={clearCart} className='btn-secondary'>
                    <Trash2 className='w-5 h-5 mr-2' />
                    Clear Cart
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className='gaming-card h-fit'>
              <h2 className='text-2xl font-gaming font-bold text-white mb-6'>Order Summary</h2>

              <div className='space-y-4 mb-6'>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Items ({cartState.totalItems}):</span>
                  <span className='text-white'>${cartState.totalAmount.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Crypto Amount:</span>
                  <span className='text-gaming-gold'>{cartState.totalUSDC.toFixed(6)} USDC</span>
                </div>
                <div className='border-t border-gaming-cyan/30 pt-4'>
                  <div className='flex justify-between text-lg font-bold'>
                    <span className='text-white'>Total:</span>
                    <span className='text-gaming-neon'>{cartState.totalUSDC.toFixed(6)} USDC</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='space-y-4'>
                <button onClick={() => router.push('/gift-cards')} className='btn-secondary w-full'>
                  <Gift className='w-5 h-5 mr-2' />
                  Continue Shopping
                </button>
                <button onClick={() => router.push('/checkout')} className='btn-neon w-full'>
                  <CreditCard className='w-5 h-5 mr-2' />
                  Proceed to Checkout
                  <ArrowRight className='w-5 h-5 ml-2' />
                </button>
              </div>

              {/* Security Notice */}
              <div className='mt-6 p-4 rounded-lg border border-gaming-neon/30 bg-gaming-neon/10'>
                <div className='flex items-center space-x-3'>
                  <Shield className='w-6 h-6 text-gaming-neon' />
                  <div>
                    <div className='font-semibold text-gaming-neon'>Secure Checkout</div>
                    <div className='text-sm text-gray-300'>
                      Your payment is secured with blockchain technology and instant delivery.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
