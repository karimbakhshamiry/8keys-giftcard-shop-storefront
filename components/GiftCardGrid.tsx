'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Star, 
  ArrowRight, 
  Gift,
  SlidersHorizontal,
  Grid3X3,
  List,
  ShoppingCart,
  Plus,
  Coins
} from './icons'
// import { useCart } from '../lib/cart-context'
import { useCart } from '@/contexts/CartProvider2'
import { useSearch } from '../lib/search-context'
import type { GiftCard } from '../lib/cart-context'

export default function GiftCardGrid() {
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const { addToCart } = useCart()
  const { searchTerm, setSearchTerm } = useSearch()

  const giftCards: GiftCard[] = [
    // Steam Gift Cards
    {
      id: 'steam-10',
      name: 'Steam Gift Card',
      platform: 'Steam',
      amount: 10,
      currency: 'USD',
      usdcPrice: '10.00',
      rating: 4.9,
      reviews: 15420,
      discount: 0,
      popular: true,
      color: 'from-blue-600 to-blue-800',
      description: 'Perfect for indie games and small purchases'
    },
    {
      id: 'steam-25',
      name: 'Steam Gift Card',
      platform: 'Steam',
      amount: 25,
      currency: 'USD',
      usdcPrice: '24.25',
      rating: 4.9,
      reviews: 15420,
      discount: 3,
      popular: true,
      color: 'from-blue-600 to-blue-800',
      description: 'Great for most games and DLCs'
    },
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
    
    // Xbox Live Gift Cards
    {
      id: 'xbox-15',
      name: 'Xbox Live Gift Card',
      platform: 'Xbox',
      amount: 15,
      currency: 'USD',
      usdcPrice: '15.00',
      rating: 4.8,
      reviews: 12850,
      discount: 0,
      popular: true,
      color: 'from-green-600 to-green-800',
      description: 'Xbox Live and Game Pass compatible'
    },
    {
      id: 'xbox-25',
      name: 'Xbox Live Gift Card',
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
      id: 'xbox-50',
      name: 'Xbox Live Gift Card',
      platform: 'Xbox',
      amount: 50,
      currency: 'USD',
      usdcPrice: '48.00',
      rating: 4.8,
      reviews: 12850,
      discount: 4,
      popular: false,
      color: 'from-green-600 to-green-800',
      description: 'Premium games and subscriptions'
    },

    // Rewarble
    {
      id: 'rewarble-20',
      name: 'Rewarble Gift Card',
      platform: 'Rewarble',
      amount: 20,
      currency: 'USD',
      usdcPrice: '20.00',
      rating: 4.6,
      reviews: 5430,
      discount: 0,
      popular: false,
      color: 'from-purple-600 to-purple-800',
      description: 'Flexible rewards and gift solutions'
    },
    {
      id: 'rewarble-50',
      name: 'Rewarble Gift Card',
      platform: 'Rewarble',
      amount: 50,
      currency: 'USD',
      usdcPrice: '49.00',
      rating: 4.6,
      reviews: 5430,
      discount: 2,
      popular: false,
      color: 'from-purple-600 to-purple-800',
      description: 'Premium flexible rewards'
    },

    // Cryptovoucher
    {
      id: 'cryptovoucher-25',
      name: 'Cryptovoucher',
      platform: 'Cryptovoucher',
      amount: 25,
      currency: 'USD',
      usdcPrice: '25.00',
      rating: 4.7,
      reviews: 8920,
      discount: 0,
      popular: true,
      color: 'from-orange-600 to-orange-800',
      description: 'Easy crypto purchases worldwide'
    },
    {
      id: 'cryptovoucher-100',
      name: 'Cryptovoucher',
      platform: 'Cryptovoucher',
      amount: 100,
      currency: 'USD',
      usdcPrice: '98.00',
      rating: 4.7,
      reviews: 8920,
      discount: 2,
      popular: false,
      color: 'from-orange-600 to-orange-800',
      description: 'Large denomination crypto voucher'
    },

    // Giftmecrypto
    {
      id: 'giftmecrypto-30',
      name: 'Giftmecrypto Voucher',
      platform: 'Giftmecrypto',
      amount: 30,
      currency: 'USD',
      usdcPrice: '30.00',
      rating: 4.5,
      reviews: 3250,
      discount: 0,
      popular: false,
      color: 'from-teal-600 to-teal-800',
      description: 'Cryptocurrency gift vouchers'
    },
    {
      id: 'giftmecrypto-75',
      name: 'Giftmecrypto Voucher',
      platform: 'Giftmecrypto',
      amount: 75,
      currency: 'USD',
      usdcPrice: '73.50',
      rating: 4.5,
      reviews: 3250,
      discount: 2,
      popular: false,
      color: 'from-teal-600 to-teal-800',
      description: 'Premium crypto gift solution'
    },

    // Binance
    {
      id: 'binance-50',
      name: 'Binance Gift Card',
      platform: 'Binance',
      amount: 50,
      currency: 'USD',
      usdcPrice: '50.00',
      rating: 4.8,
      reviews: 12400,
      discount: 0,
      popular: true,
      color: 'from-yellow-600 to-yellow-800',
      description: 'Leading crypto exchange platform'
    },
    {
      id: 'binance-100',
      name: 'Binance Gift Card',
      platform: 'Binance',
      amount: 100,
      currency: 'USD',
      usdcPrice: '97.00',
      rating: 4.8,
      reviews: 12400,
      discount: 3,
      popular: false,
      color: 'from-yellow-600 to-yellow-800',
      description: 'Premium crypto trading access'
    },

    // Apple
    {
      id: 'apple-25',
      name: 'Apple Gift Card',
      platform: 'Apple',
      amount: 25,
      currency: 'USD',
      usdcPrice: '24.50',
      rating: 4.8,
      reviews: 18200,
      discount: 2,
      popular: true,
      color: 'from-gray-700 to-gray-900',
      description: 'App Store, iTunes, and Apple services'
    },
    {
      id: 'apple-50',
      name: 'Apple Gift Card',
      platform: 'Apple',
      amount: 50,
      currency: 'USD',
      usdcPrice: '49.00',
      rating: 4.8,
      reviews: 18200,
      discount: 2,
      popular: false,
      color: 'from-gray-700 to-gray-900',
      description: 'Premium Apple ecosystem access'
    },

    // Roblox
    {
      id: 'roblox-10',
      name: 'Roblox Gift Card',
      platform: 'Roblox',
      amount: 10,
      currency: 'USD',
      usdcPrice: '10.00',
      rating: 4.7,
      reviews: 22500,
      discount: 0,
      popular: true,
      color: 'from-red-500 to-red-700',
      description: 'Robux and premium content'
    },
    {
      id: 'roblox-25',
      name: 'Roblox Gift Card',
      platform: 'Roblox',
      amount: 25,
      currency: 'USD',
      usdcPrice: '24.50',
      rating: 4.7,
      reviews: 22500,
      discount: 2,
      popular: true,
      color: 'from-red-500 to-red-700',
      description: 'More Robux for premium experiences'
    },

    // Spotify
    {
      id: 'spotify-15',
      name: 'Spotify Gift Card',
      platform: 'Spotify',
      amount: 15,
      currency: 'USD',
      usdcPrice: '15.00',
      rating: 4.6,
      reviews: 14800,
      discount: 0,
      popular: false,
      color: 'from-green-500 to-green-700',
      description: 'Premium music streaming'
    },
    {
      id: 'spotify-30',
      name: 'Spotify Gift Card',
      platform: 'Spotify',
      amount: 30,
      currency: 'USD',
      usdcPrice: '29.50',
      rating: 4.6,
      reviews: 14800,
      discount: 2,
      popular: false,
      color: 'from-green-500 to-green-700',
      description: 'Extended premium subscription'
    },

    // Twitch
    {
      id: 'twitch-10',
      name: 'Twitch Gift Card',
      platform: 'Twitch',
      amount: 10,
      currency: 'USD',
      usdcPrice: '10.00',
      rating: 4.5,
      reviews: 9600,
      discount: 0,
      popular: false,
      color: 'from-purple-500 to-purple-700',
      description: 'Bits and channel subscriptions'
    },
    {
      id: 'twitch-25',
      name: 'Twitch Gift Card',
      platform: 'Twitch',
      amount: 25,
      currency: 'USD',
      usdcPrice: '25.00',
      rating: 4.5,
      reviews: 9600,
      discount: 0,
      popular: false,
      color: 'from-purple-500 to-purple-700',
      description: 'Support your favorite streamers'
    },

    // Uber
    {
      id: 'uber-20',
      name: 'Uber Gift Card',
      platform: 'Uber',
      amount: 20,
      currency: 'USD',
      usdcPrice: '20.00',
      rating: 4.4,
      reviews: 7300,
      discount: 0,
      popular: false,
      color: 'from-black to-gray-800',
      description: 'Rides and Uber Eats delivery'
    },
    {
      id: 'uber-50',
      name: 'Uber Gift Card',
      platform: 'Uber',
      amount: 50,
      currency: 'USD',
      usdcPrice: '49.00',
      rating: 4.4,
      reviews: 7300,
      discount: 2,
      popular: false,
      color: 'from-black to-gray-800',
      description: 'Extended transportation credit'
    },

    // Nintendo
    {
      id: 'nintendo-20',
      name: 'Nintendo eShop Card',
      platform: 'Nintendo',
      amount: 20,
      currency: 'USD',
      usdcPrice: '20.00',
      rating: 4.6,
      reviews: 11400,
      discount: 0,
      popular: false,
      color: 'from-red-600 to-red-800',
      description: 'Switch games and digital content'
    },
    {
      id: 'nintendo-35',
      name: 'Nintendo eShop Card',
      platform: 'Nintendo',
      amount: 35,
      currency: 'USD',
      usdcPrice: '32.20',
      rating: 4.6,
      reviews: 11400,
      discount: 8,
      popular: false,
      color: 'from-red-600 to-red-800',
      description: 'Premium Switch gaming content'
    },

    // Netflix
    {
      id: 'netflix-15',
      name: 'Netflix Gift Card',
      platform: 'Netflix',
      amount: 15,
      currency: 'USD',
      usdcPrice: '15.00',
      rating: 4.7,
      reviews: 16800,
      discount: 0,
      popular: true,
      color: 'from-red-600 to-red-800',
      description: 'Streaming entertainment subscription'
    },
    {
      id: 'netflix-30',
      name: 'Netflix Gift Card',
      platform: 'Netflix',
      amount: 30,
      currency: 'USD',
      usdcPrice: '29.50',
      rating: 4.7,
      reviews: 16800,
      discount: 2,
      popular: false,
      color: 'from-red-600 to-red-800',
      description: 'Extended streaming access'
    },

    // Paysafecard
    {
      id: 'paysafecard-10',
      name: 'Paysafecard',
      platform: 'Paysafecard',
      amount: 10,
      currency: 'USD',
      usdcPrice: '10.00',
      rating: 4.5,
      reviews: 8900,
      discount: 0,
      popular: false,
      color: 'from-blue-500 to-blue-700',
      description: 'Secure online payment solution'
    },
    {
      id: 'paysafecard-25',
      name: 'Paysafecard',
      platform: 'Paysafecard',
      amount: 25,
      currency: 'USD',
      usdcPrice: '25.00',
      rating: 4.5,
      reviews: 8900,
      discount: 0,
      popular: false,
      color: 'from-blue-500 to-blue-700',
      description: 'Secure payment for online services'
    },

    // Riot Games
    {
      id: 'riot-10',
      name: 'Riot Points Card',
      platform: 'Riot',
      amount: 10,
      currency: 'USD',
      usdcPrice: '10.00',
      rating: 4.8,
      reviews: 19500,
      discount: 0,
      popular: true,
      color: 'from-cyan-600 to-cyan-800',
      description: 'League of Legends and Valorant'
    },
    {
      id: 'riot-25',
      name: 'Riot Points Card',
      platform: 'Riot',
      amount: 25,
      currency: 'USD',
      usdcPrice: '24.00',
      rating: 4.8,
      reviews: 19500,
      discount: 4,
      popular: false,
      color: 'from-cyan-600 to-cyan-800',
      description: 'Premium gaming content and skins'
    }
  ]

  const platforms = ['all', 'Steam', 'Xbox', 'Rewarble', 'Cryptovoucher', 'Giftmecrypto', 'Binance', 'Apple', 'Roblox', 'Spotify', 'Twitch', 'Uber', 'Nintendo', 'Netflix', 'Paysafecard', 'Riot']
  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: '0-20', label: '$0 - $20' },
    { value: '20-50', label: '$20 - $50' },
    { value: '50+', label: '$50+' }
  ]

  const filteredCards = useMemo(() => {
    let filtered = giftCards

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.platform.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(card => card.platform === selectedPlatform)
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(p => p.replace('+', ''))
      filtered = filtered.filter(card => {
        if (priceRange === '50+') return card.amount >= 50
        return card.amount >= parseInt(min) && card.amount <= parseInt(max)
      })
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
        break
      case 'price-low':
        filtered.sort((a, b) => a.amount - b.amount)
        break
      case 'price-high':
        filtered.sort((a, b) => b.amount - a.amount)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
    }

    return filtered
  }, [searchTerm, selectedPlatform, priceRange, sortBy])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const handleAddToCart = (giftCard: GiftCard) => {
    addToCart(giftCard.id)
  }

  return (
    <div className="space-y-8">
      {/* Filters Only - Search moved to header */}
      <div className="space-y-4">
        {/* Filter Controls - Made Inline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-4 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="select-cyber min-w-[140px]"
            >
              {platforms.map(platform => (
                <option key={platform} value={platform}>
                  {platform === 'all' ? 'All Platforms' : platform}
                </option>
              ))}
            </select>

            {/* Price Range Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="select-cyber min-w-[120px]"
            >
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select-cyber min-w-[160px]"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* View Mode and Results */}
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <span className="text-sm text-gray-400">
              {filteredCards.length} cards found
            </span>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-gaming-purple/20 text-gaming-cyan' 
                    : 'text-gray-400 hover:text-gaming-cyan'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-gaming-purple/20 text-gaming-cyan' 
                    : 'text-gray-400 hover:text-gaming-cyan'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gift Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedPlatform}-${priceRange}-${sortBy}-${searchTerm}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredCards.map((card) => {
            // const inCartQuantity = getItemQuantity(card.id)
            const inCartQuantity = 99
            
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                className={`gaming-card group relative overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center space-x-6' : ''
                }`}
                whileHover={{ y: viewMode === 'grid' ? -8 : 0, scale: viewMode === 'grid' ? 1.02 : 1 }}
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
                <div className={`relative rounded-lg overflow-hidden ${
                  viewMode === 'grid' ? 'h-48 mb-6' : 'w-32 h-20 flex-shrink-0'
                }`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-80`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white font-gaming font-bold text-center">
                      <div className={viewMode === 'grid' ? 'text-4xl mb-2' : 'text-lg'}>
                        {card.platform}
                      </div>
                      {viewMode === 'grid' && (
                        <div className="text-lg opacity-80">Gift Card</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className={`space-y-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className={viewMode === 'list' ? 'flex items-center justify-between' : ''}>
                    <div>
                      <h3 className="text-xl font-gaming font-semibold text-white mb-2">
                        {card.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                        <Star className="w-4 h-4 text-gaming-gold fill-current" />
                        <span>{card.rating}</span>
                        <span>({card.reviews.toLocaleString()} reviews)</span>
                      </div>
                      {viewMode === 'list' && (
                        <p className="text-sm text-gray-400">{card.description}</p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className={viewMode === 'list' ? 'text-right' : 'flex items-center justify-between'}>
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
                      {card.discount > 0 && viewMode === 'grid' && (
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
                  </div>

                  {viewMode === 'grid' && (
                    <p className="text-sm text-gray-400">{card.description}</p>
                  )}

                  {/* Action Buttons */}
                  <div className={`flex ${viewMode === 'list' ? 'space-x-2' : 'space-x-3'}`}>
                    <button
                      onClick={() => handleAddToCart(card)}
                      className={`group relative overflow-hidden border border-gaming-cyan/30 bg-gaming-cyan/10 hover:bg-gaming-cyan hover:border-gaming-cyan text-gaming-cyan hover:text-gaming-dark transition-all duration-300 font-semibold rounded-lg flex items-center justify-center ${
                        viewMode === 'list' ? 'px-4 py-2 text-sm flex-1' : 'flex-1 py-3'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Add to Cart
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gaming-cyan/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    </button>

                    <Link
                      href={`/checkout?card=${card.id}`}
                      className={`btn-neon group flex items-center justify-center ${
                        viewMode === 'list' ? 'px-4 py-2 text-sm flex-1' : 'flex-1'
                      }`}
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
      </AnimatePresence>

      {/* No Results */}
      {filteredCards.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-gaming font-semibold text-gray-400 mb-2">
            No gift cards found
          </h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your search criteria or browse all available cards.
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedPlatform('all')
              setPriceRange('all')
            }}
            className="btn-neon"
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>
  )
} 