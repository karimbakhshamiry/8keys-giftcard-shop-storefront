'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart, Plus, Coins } from './icons'
import { useCart } from '../lib/cart-context'
import { HttpTypes } from '../lib/types'

interface ProductCardProps {
  product: HttpTypes.StoreProduct
  countryCode?: string
}

export default function ProductCard({ product, countryCode = 'us' }: ProductCardProps) {
  const { addToCart, getItemQuantity } = useCart()

  // Get the first variant for pricing
  const variant = product.variants?.[0]
  const price = variant?.calculated_price?.calculated_amount || variant?.prices?.[0]?.amount || 0
  const currencyCode =
    variant?.calculated_price?.currency_code || variant?.prices?.[0]?.currency_code || 'USD'

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(price) // Assuming price is in cents

  // Get product image
  const imageUrl = product.thumbnail || product.images?.[0]?.url || '/placeholder-gift-card.jpg'

  // Extract platform from title or metadata
  const platform = product.metadata?.platform || product.title?.split(' ')[0] || 'Gift Card'

  // Determine color based on platform
  const getPlatformColor = (platform: string) => {
    const platformLower = platform.toLowerCase()
    if (platformLower.includes('steam')) return 'from-blue-600 to-blue-800'
    if (platformLower.includes('xbox')) return 'from-green-600 to-green-800'
    if (platformLower.includes('playstation') || platformLower.includes('psn'))
      return 'from-blue-500 to-blue-700'
    if (platformLower.includes('nintendo')) return 'from-red-600 to-red-800'
    if (platformLower.includes('amazon')) return 'from-orange-500 to-orange-700'
    if (platformLower.includes('google') || platformLower.includes('play'))
      return 'from-green-500 to-green-700'
    if (platformLower.includes('apple') || platformLower.includes('itunes'))
      return 'from-gray-600 to-gray-800'
    if (platformLower.includes('crypto') || platformLower.includes('voucher'))
      return 'from-purple-600 to-purple-800'
    return 'from-indigo-600 to-indigo-800'
  }

  const platformColor = getPlatformColor(platform)

  const handleAddToCart = () => {
    if (variant?.inventory_quantity == undefined || variant?.inventory_quantity <= quantity) {
      return
    } else {
      // Create a GiftCard object that matches the cart context interface
      const giftCard = {
        id: product.id,
        name: product.title,
        platform: platform,
        amount: price, // Convert to dollars
        currency: currencyCode,
        usdcPrice: price.toFixed(2), // Convert to string for USDC price
        rating: 4.8, // Default rating
        reviews: 1250, // Default reviews
        discount: 0, // Default discount
        popular: product.metadata?.popular === true,
        color: platformColor,
        description: product.description || 'Premium gift card for gaming and entertainment',
        external_id: product.subtitle, // Use product.subtitle as external_id
        maxInStock: variant?.inventory_quantity ?? 0
      }
      addToCart(giftCard)
    }
  }

  const quantity = getItemQuantity(product.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='group relative h-full'
    >
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 dark:border-zinc-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 h-full flex flex-col'>
        {/* Background glow effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${platformColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
        />

        {/* Product image */}
        <div className='relative h-48 overflow-hidden'>
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            className='object-cover transition-transform duration-500 group-hover:scale-110'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />

          {/* Platform badge */}
          <div className='absolute top-3 left-3'>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${platformColor} text-white shadow-lg`}
            >
              {platform}
            </span>
          </div>

          {/* Rating */}
          <div className='absolute top-3 right-3 flex items-center space-x-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1'>
            <Star className='w-3 h-3 text-yellow-400 fill-current' />
            <span className='text-xs text-white font-medium'>4.8</span>
          </div>
        </div>

        {/* Product info and actions */}
        <div className='flex flex-col flex-1 justify-between p-4 min-h-[180px]'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300'>
              {product.title}
            </h3>
            {product.description && (
              <p className='text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2'>
                {product.description}
              </p>
            )}
          </div>

          <div className='mt-auto'>
            {/* Price and action */}
            <div className='flex items-center justify-between mt-2'>
              <div className='flex items-center space-x-2'>
                <Coins className='w-4 h-4 text-yellow-500' />
                <span className='text-xl font-bold text-gray-900 dark:text-white'>
                  {formattedPrice}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={
                  variant?.inventory_quantity == undefined ||
                  variant?.inventory_quantity <= quantity
                }
                className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${platformColor} text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 z-10 disabled:cursor-not-allowed`}
              >
                {quantity > 0 ? (
                  <>
                    <span className='text-sm'>{quantity} in cart</span>
                    <Plus className='w-4 h-4' />
                  </>
                ) : (
                  <>
                    <ShoppingCart className='w-4 h-4' />
                    <span className='text-sm'>Add to Cart</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Stock indicator */}
            {variant?.inventory_quantity !== undefined && (
              <div className='mt-3 text-xs text-gray-500 dark:text-gray-400'>
                {variant.inventory_quantity > 0 ? (
                  <span className='text-green-600 dark:text-green-400'>
                    ✓ In Stock ({variant.inventory_quantity} available)
                  </span>
                ) : (
                  <span className='text-red-600 dark:text-red-400'>✗ Out of Stock</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hover overlay */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
      </div>
    </motion.div>
  )
}
