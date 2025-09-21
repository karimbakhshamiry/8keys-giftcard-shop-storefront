'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, Gift, CreditCard, Coins } from './icons'
import { useCart } from '../lib/cart-context'

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { state, updateQuantity, removeFromCart, clearCart, getItemQuantity } = useCart()

  const handleIncreaseQuantity = (id: string, currentQuantity: number) => {
    // alert(getItemQuantity(id))
    updateQuantity(id, currentQuantity + 1)
  }

  const handleDecreaseQuantity = (id: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      removeFromCart(id)
    } else {
      updateQuantity(id, currentQuantity - 1)
    }
  }

  const handleRemoveItem = (id: string) => {
    removeFromCart(id)
  }

  const handleClearCart = () => {
    clearCart()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50'
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className='fixed right-0 top-0 h-full w-full max-w-md transition-colors duration-500 dark:bg-gaming-darker light:bg-white/95 light:backdrop-blur-sm dark:border-l dark:border-gaming-purple/30 light:border-l light:border-gray-200 z-50 shadow-2xl'
          >
            <div className='flex flex-col h-full'>
              {/* Header */}
              <div className='flex items-center justify-between p-6 transition-colors duration-300 dark:border-b dark:border-gaming-purple/30 light:border-b light:border-gray-200'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 transition-colors duration-300 dark:bg-gaming-purple/20 light:bg-blue-100 rounded-lg'>
                    <ShoppingCart className='w-6 h-6 transition-colors duration-300 dark:text-gaming-cyan light:text-blue-600' />
                  </div>
                  <div>
                    <h2 className='text-xl font-gaming font-bold transition-colors duration-300 dark:text-white light:text-gray-900'>
                      Shopping Cart
                    </h2>
                    <p className='text-sm transition-colors duration-300 dark:text-gray-400 light:text-gray-600'>
                      {state.totalItems} {state.totalItems === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className='p-2 transition-colors duration-300 dark:hover:bg-gaming-purple/20 light:hover:bg-gray-100 rounded-lg'
                >
                  <X className='w-6 h-6 transition-colors duration-300 dark:text-gray-400 dark:hover:text-white light:text-gray-500 light:hover:text-gray-900' />
                </button>
              </div>

              {/* Cart Content */}
              <div className='flex-1 overflow-y-auto'>
                {state.items.length === 0 ? (
                  /* Empty Cart */
                  <div className='flex flex-col items-center justify-center h-full p-6 text-center'>
                    <div className='p-4 transition-colors duration-300 dark:bg-gaming-purple/10 light:bg-blue-100/50 rounded-full mb-4'>
                      <ShoppingCart className='w-12 h-12 transition-colors duration-300 dark:text-gray-400 light:text-gray-500' />
                    </div>
                    <h3 className='text-xl font-gaming font-semibold mb-2 transition-colors duration-300 dark:text-white light:text-gray-900'>
                      Your cart is empty
                    </h3>
                    <p className='mb-6 transition-colors duration-300 dark:text-gray-400 light:text-gray-600'>
                      Add some gaming gift cards to get started!
                    </p>
                    <Link href='/gift-cards' onClick={onClose} className='btn-neon'>
                      <Gift className='w-4 h-4 mr-2' />
                      Browse Gift Cards
                    </Link>
                  </div>
                ) : (
                  /* Cart Items */
                  <div className='p-4 space-y-4'>
                    {state.items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className='gaming-card relative'
                      >
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className='absolute top-2 right-2 p-1 transition-colors duration-300 dark:hover:bg-gaming-purple/20 light:hover:bg-red-100 rounded z-10'
                        >
                          <X className='w-4 h-4 transition-colors duration-300 dark:text-gray-400 dark:hover:text-gaming-neon light:text-gray-500 light:hover:text-red-600' />
                        </button>

                        {/* Item Content */}
                        <div className='flex items-center space-x-4'>
                          {/* Platform Image */}
                          <div
                            className={`w-16 h-16 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}
                          >
                            <div className='text-white font-gaming font-bold text-xs text-center'>
                              {item.platform}
                            </div>
                          </div>

                          {/* Item Details */}
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-gaming font-semibold truncate transition-colors duration-300 dark:text-white light:text-gray-900'>
                              {item.name}
                            </h4>
                            <p className='text-sm transition-colors duration-300 dark:text-gray-400 light:text-gray-600'>
                              {item.platform}
                            </p>

                            {/* Pricing */}
                            <div className='mt-1'>
                              <div className='text-lg font-bold transition-colors duration-300 dark:text-white light:text-gray-900'>
                                ${item.amount}
                                <span className='text-sm transition-colors duration-300 dark:text-gray-400 light:text-gray-600 ml-1'>
                                  {item.currency}
                                </span>
                              </div>
                              <div className='text-sm transition-colors duration-300 dark:text-gaming-cyan light:text-blue-600 flex items-center'>
                                <Coins className='w-3 h-3 mr-1' />
                                {item.usdcPrice} USDC
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className='flex items-center space-x-3 mt-3'>
                              <button
                                onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                                className='w-10 h-10 rounded-lg transition-all duration-200 dark:bg-gradient-to-br dark:from-gaming-dark dark:to-gaming-darker dark:border-2 dark:border-gaming-purple/50 dark:text-white dark:hover:border-gaming-cyan light:bg-gradient-to-br light:from-gray-100 light:to-gray-200 light:border-2 light:border-gray-300 light:text-gray-700 light:hover:border-blue-500 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer relative z-10'
                                style={{ pointerEvents: 'auto' }}
                              >
                                <Minus className='w-5 h-5' />
                              </button>

                              <div className='w-12 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 dark:bg-gaming-dark/50 dark:border dark:border-gaming-purple/30 light:bg-gray-50 light:border light:border-gray-300'>
                                <span className='font-gaming font-bold text-lg transition-colors duration-300 dark:text-white light:text-gray-900'>
                                  {item.quantity}
                                </span>
                              </div>

                              <button
                                onClick={() =>
                                  item.maxInStock > item.quantity &&
                                  handleIncreaseQuantity(item.id, item.quantity)
                                }
                                className='w-10 h-10 rounded-lg transition-all duration-200 dark:bg-gradient-to-br dark:from-gaming-dark dark:to-gaming-darker dark:border-2 dark:border-gaming-purple/50 dark:text-white dark:hover:border-gaming-cyan light:bg-gradient-to-br light:from-gray-100 light:to-gray-200 light:border-2 light:border-gray-300 light:text-gray-700 light:hover:border-blue-500 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer relative z-10 disabled:cursor-not-allowed'
                                style={{ pointerEvents: 'auto' }}
                                disabled={item.maxInStock <= item.quantity}
                              >
                                <Plus className='w-5 h-5' />
                              </button>

                              {/* Item Total */}
                              <div className='ml-auto text-right'>
                                <div className='font-semibold text-lg transition-colors duration-300 dark:text-white light:text-gray-900'>
                                  ${(item.amount * item.quantity).toFixed(2)}
                                </div>
                                <div className='text-xs font-medium transition-colors duration-300 dark:text-gaming-cyan light:text-blue-600'>
                                  {(parseFloat(item.usdcPrice) * item.quantity).toFixed(2)} USDC
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Clear Cart Button */}
                    {state.items.length > 0 && (
                      <button
                        onClick={handleClearCart}
                        className='w-full py-2 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-colors flex items-center justify-center space-x-2'
                      >
                        <Trash2 className='w-4 h-4' />
                        <span>Clear Cart</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Footer / Checkout */}
              {state.items.length > 0 && (
                <div className='transition-colors duration-300 dark:border-t dark:border-gaming-purple/30 light:border-t light:border-gray-200 p-6'>
                  {/* Totals */}
                  <div className='space-y-2 mb-6'>
                    <div className='flex justify-between transition-colors duration-300 dark:text-gray-400 light:text-gray-600'>
                      <span>Subtotal ({state.totalItems} items):</span>
                      <span>${state.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between text-sm transition-colors duration-300 dark:text-gaming-cyan light:text-blue-600'>
                      <span>USDC Total:</span>
                      <span>{state.totalUSDC.toFixed(2)} USDC</span>
                    </div>
                    <div className='transition-colors duration-300 dark:border-t dark:border-gaming-purple/30 light:border-t light:border-gray-200 pt-2'>
                      <div className='flex justify-between text-xl font-gaming font-bold transition-colors duration-300 dark:text-white light:text-gray-900'>
                        <span>Total:</span>
                        <div className='text-right'>
                          <div>${state.totalAmount.toFixed(2)}</div>
                          <div className='text-sm transition-colors duration-300 dark:text-gaming-cyan light:text-blue-600'>
                            {state.totalUSDC.toFixed(2)} USDC
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href='/checkout'
                    onClick={onClose}
                    className='btn-neon w-full flex items-center justify-center'
                  >
                    <CreditCard className='w-5 h-5 mr-2' />
                    Proceed to Checkout
                    <ArrowRight className='w-5 h-5 ml-2' />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
