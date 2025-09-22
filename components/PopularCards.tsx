'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowRight, Gift, ShoppingCart, Coins } from './icons'
import { useCart } from '../lib/cart-context'
import type { GiftCard } from '../lib/cart-context'

// Add Zap and Plus icons to our icons file if not already there
const Zap: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
  </svg>
)

export default function PopularCards() {
  return null
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const { addToCart, getItemQuantity } = useCart()

  const popularCards: GiftCard[] = [
    {
      id: 'steam-50',
      name: 'Steam Gift Card',
      platform: 'Steam',
      amount: 50,
      currency: 'USD',
      usdcPrice: '47.50',
      rating: 4.9,
      reviews: 15420,
      discount: 5,
      popular: true,
      color: 'from-blue-600 to-blue-800',
      description: 'Perfect for AAA games and multiple purchases'
    },
    {
      id: 'xbox-25',
      name: 'Xbox Gift Card',
      platform: 'Xbox',
      amount: 25,
      currency: 'USD',
      usdcPrice: '24.25',
      rating: 4.8,
      reviews: 12850,
      discount: 3,
      popular: true,
      color: 'from-green-600 to-green-800',
      description: 'Great for games and subscriptions'
    },
    {
      id: 'playstation-30',
      name: 'PlayStation Store',
      platform: 'PlayStation',
      amount: 30,
      currency: 'USD',
      usdcPrice: '30.00',
      rating: 4.7,
      reviews: 9640,
      discount: 0,
      popular: false,
      color: 'from-blue-800 to-indigo-900',
      description: 'PS4 and PS5 games, add-ons, and more'
    },
    {
      id: 'nintendo-35',
      name: 'Nintendo eShop',
      platform: 'Nintendo',
      amount: 35,
      currency: 'USD',
      usdcPrice: '32.20',
      rating: 4.6,
      reviews: 7230,
      discount: 8,
      popular: false,
      color: 'from-red-600 to-red-800',
      description: 'Switch games and digital content'
    },
    {
      id: 'google-play-20',
      name: 'Google Play Card',
      platform: 'Google Play',
      amount: 20,
      currency: 'USD',
      usdcPrice: '0.00050 USDC',
      rating: 4.5,
      reviews: 18750,
      discount: 2,
      popular: true,
      color: 'from-green-500 to-green-700',
      description: 'Google Play gift cards for Android apps and games'
    },
    {
      id: 'apple-50',
      name: 'App Store & iTunes',
      platform: 'Apple',
      amount: 50,
      currency: 'USD',
      usdcPrice: '0.00125 USDC',
      rating: 4.8,
      reviews: 11200,
      discount: 4,
      popular: false,
      color: 'from-gray-700 to-gray-900',
      description: 'Apple gift cards for iTunes, App Store, and more'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const handleAddToCart = (card: GiftCard) => {
    addToCart(card)
  }

  return (
    <section className="py-20 bg-gaming-darker/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-gaming-neon mr-3" />
            <h2 className="text-4xl md:text-5xl font-gaming font-bold">
              <span className="text-white">Popular </span>
              <span className="cyber-text">Gift Cards</span>
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Top-rated gaming gift cards chosen by thousands of satisfied customers. 
            Instant delivery, secure payments with USDC.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {popularCards.map((card) => {
            const inCartQuantity = getItemQuantity(card.id)
            
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                className="gaming-card group relative overflow-hidden"
                onHoverStart={() => setHoveredCard(card.id)}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Popular Badge */}
                {card.popular && (
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-gaming-neon text-gaming-dark text-xs font-bold px-2 py-1 rounded-full">
                      POPULAR
                    </div>
                  </div>
                )}

                {/* Discount Badge */}
                {card.discount > 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gaming-gold text-gaming-dark text-xs font-bold px-2 py-1 rounded-full">
                      -{card.discount}%
                    </div>
                  </div>
                )}

                {/* Cart Quantity Badge */}
                {inCartQuantity > 0 && (
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gaming-cyan text-gaming-dark text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                      <ShoppingCart className="w-3 h-3" />
                      <span>{inCartQuantity}</span>
                    </div>
                  </div>
                )}

                {/* Card Image */}
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-80`} />
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    animate={hoveredCard === card.id ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-white font-gaming font-bold text-center">
                      <div className="text-4xl mb-2">{card.platform}</div>
                      <div className="text-lg opacity-80">Gift Card</div>
                    </div>
                  </motion.div>
                  
                  {/* Hover overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gaming-neon/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredCard === card.id ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-gaming font-semibold text-white mb-2">
                      {card.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Star className="w-4 h-4 text-gaming-gold fill-current" />
                      <span>{card.rating}</span>
                      <span>({card.reviews.toLocaleString()} reviews)</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        ${card.amount}
                        <span className="text-sm text-gray-400 ml-1">{card.currency}</span>
                      </div>
                      <div className="text-sm text-gaming-cyan flex items-center">
                        <Coins className="w-3 h-3 mr-1" />
                        {card.usdcPrice} USDC
                      </div>
                    </div>
                    {card.discount > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-gray-400 line-through">
                          ${(card.amount / (1 - card.discount / 100)).toFixed(2)}
                        </div>
                        <div className="text-gaming-neon font-semibold">
                          Save ${((card.amount / (1 - card.discount / 100)) - card.amount).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-400">{card.description}</p>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAddToCart(card)}
                      className="group relative overflow-hidden border border-gaming-cyan/30 bg-gaming-cyan/10 hover:bg-gaming-cyan hover:border-gaming-cyan text-gaming-cyan hover:text-gaming-dark transition-all duration-300 font-semibold rounded-lg flex items-center justify-center flex-1 py-3"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Add to Cart
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gaming-cyan/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>

                    <Link
                      href={`/checkout?card=${card.id}`}
                      className="btn-neon group flex items-center justify-center flex-1"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Buy Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <Link href="/gift-cards" className="btn-neon text-lg px-8 py-4">
            <Gift className="w-5 h-5 mr-3" />
            View All Gift Cards
            <ArrowRight className="w-5 h-5 ml-3" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
} 