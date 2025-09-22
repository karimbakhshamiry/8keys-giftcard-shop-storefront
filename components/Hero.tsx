'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play, Shield, Zap, Globe, Star } from './icons'
// import { useCart } from '../lib/cart-context'

export default function Hero() {
  const stats = [
    { label: 'Active Users', value: '50K+', icon: '👥' },
    { label: 'Gift Cards', value: '500+', icon: '🎮' },
    { label: 'Satisfaction', value: '99%', icon: '⭐' },
    { label: 'Countries', value: '100+', icon: '🌍' }
  ]

  const features = [
    { 
      icon: Shield, 
      label: 'Secure & Encrypted',
      description: 'Military-grade security for all transactions'
    },
    { 
      icon: Zap, 
      label: 'Instant Delivery',
      description: 'Get your cards within seconds of payment'
    },
    { 
      icon: Globe, 
      label: 'Global Access',
      description: 'Available in 100+ countries worldwide'
    }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 transition-colors duration-500">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center space-x-2 mb-6 px-4 py-2 rounded-full border transition-all duration-300 dark:bg-gaming-dark/50 dark:border-gaming-purple/30 dark:text-gaming-cyan light:bg-white/80 light:border-blue-200 light:text-blue-600 light:shadow-sm"
            >
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Trusted by 50,000+ Gamers</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-gaming font-bold leading-tight mb-6"
            >
              <span className="text-gradient-primary">Premium</span>
              <br />
              <span className="transition-colors duration-300 dark:text-white light:text-gray-900">Gaming</span>
              <br />
              <span className="cyber-text">Gift Cards</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl mb-8 leading-relaxed transition-colors duration-300 dark:text-gray-300 light:text-gray-600"
            >
              Experience the future of gaming commerce with instant delivery, 
              secure cryptocurrency payments, and premium gift cards for all major platforms.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 group dark:bg-gaming-dark/30 dark:border-gaming-purple/30 dark:hover:border-gaming-cyan/50 light:bg-white/70 light:border-gray-200 light:hover:border-blue-400 light:shadow-sm"
                >
                  <feature.icon className="w-4 h-4 transition-colors dark:text-gaming-cyan dark:group-hover:text-gaming-neon light:text-blue-600 light:group-hover:text-purple-600" />
                  <span className="text-sm font-medium transition-colors dark:text-gray-300 dark:group-hover:text-white light:text-gray-700 light:group-hover:text-gray-900">
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                href="/gift-cards"
                className="btn-neon group"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="btn-secondary group">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t transition-colors duration-300 dark:border-gaming-purple/20 light:border-gray-200"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-gaming font-bold text-gradient-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm transition-colors duration-300 dark:text-gray-400 light:text-gray-600">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Card Stack */}
            <div className="relative max-w-md mx-auto">
              {/* Background Cards */}
              <motion.div
                animate={{ 
                  rotateY: [0, 5, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute top-4 left-4 w-72 h-44 rounded-xl transition-all duration-300 dark:bg-gradient-to-br dark:from-gaming-dark/80 dark:to-gaming-darker/90 dark:border dark:border-gaming-purple/20 dark:opacity-60 light:bg-gradient-to-br light:from-slate-900 light:to-black light:border-8 light:border-blue-500 light:shadow-2xl light:shadow-black/60 light:opacity-90"
                style={{ transform: 'rotate(-5deg)' }}
              />
              
              <motion.div
                animate={{ 
                  rotateY: [0, -5, 0],
                  scale: [1, 1.01, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute top-2 right-4 w-72 h-44 rounded-xl transition-all duration-300 dark:bg-gradient-to-br dark:from-gaming-dark/70 dark:to-gaming-darker/80 dark:border dark:border-gaming-purple/15 dark:opacity-40 light:bg-gradient-to-br light:from-slate-800 light:to-slate-900 light:border-8 light:border-purple-500 light:shadow-xl light:shadow-black/50 light:opacity-80"
                style={{ transform: 'rotate(3deg)' }}
              />

              {/* Main Card */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotateY: [0, 2, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="relative z-10 w-72 h-44 mx-auto group cursor-pointer"
              >
                {/* Glassmorphism Card Background */}
                <div className="absolute inset-0 rounded-2xl backdrop-blur-xl transition-all duration-500 dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 dark:border dark:border-white/20 light:bg-gradient-to-br light:from-slate-900/95 light:to-black/90 light:border-2 light:border-slate-700/60 shadow-2xl light:shadow-black/30" />
                
                {/* Inner Glow Effect */}
                <div className="absolute inset-1 rounded-xl transition-all duration-500 dark:bg-gradient-to-br dark:from-gaming-purple/10 dark:to-gaming-cyan/5 light:bg-gradient-to-br light:from-gaming-purple/15 light:to-gaming-cyan/10" />
                
                {/* Shine Effect */}
                <div className="absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden">
                  <div className="absolute -top-2 -left-2 w-6 h-20 bg-gradient-to-b from-white/40 to-transparent rotate-12 transform translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000" />
                </div>
                
                {/* Card Content */}
                <div className="relative z-20 p-6 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      {/* Logo/Brand */}
                      <div className="w-14 h-9 rounded-lg mb-3 transition-all duration-300 dark:bg-gradient-to-r dark:from-gaming-cyan/30 dark:to-gaming-purple/20 light:bg-gradient-to-r light:from-gaming-cyan/40 light:to-gaming-purple/30 flex items-center justify-center">
                        <span className="text-xs font-bold text-gaming-cyan">GV</span>
                      </div>
                      <div className="text-sm font-bold text-white/90 tracking-wide" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                        GameVault
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black bg-gradient-to-r dark:from-gaming-cyan dark:to-gaming-neon light:from-cyan-300 light:to-blue-300 bg-clip-text text-transparent mb-1">
                        $100
                      </div>
                      <div className="text-xs font-semibold px-2 py-1 rounded-full dark:bg-gaming-cyan/20 dark:text-gaming-cyan light:bg-cyan-500/30 light:text-cyan-200 uppercase tracking-wider">
                        USDC
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-lg font-bold mb-2 bg-gradient-to-r dark:from-white dark:to-gray-300 light:from-white light:to-gray-200 bg-clip-text text-transparent">
                      Premium Gaming
                    </div>
                    <div className="text-xs font-medium dark:text-gray-400 light:text-gray-300 uppercase tracking-wide">
                      Universal • Instant • Secure
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3 w-full h-1 dark:bg-gray-700/50 light:bg-slate-600/40 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r dark:from-gaming-cyan dark:to-gaming-purple light:from-cyan-400 light:to-blue-400 rounded-full"
                        animate={{ width: ["0%", "85%"] }}
                        transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 dark:bg-gradient-to-br dark:from-gaming-neon/20 dark:to-gaming-purple/10 light:bg-gradient-to-br light:from-gaming-neon/20 light:to-gaming-purple/10 shadow-xl dark:shadow-gaming-cyan/20 light:shadow-gaming-cyan/20" />
                
                {/* Corner Accents */}
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gaming-cyan opacity-60" />
                <div className="absolute bottom-3 left-3 w-1 h-1 rounded-full bg-gaming-purple opacity-40" />
              </motion.div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute top-8 -left-4 w-16 h-16 rounded-lg transition-all duration-300 dark:bg-gaming-purple/20 light:bg-purple-200/30 dark:border dark:border-gaming-purple/30 light:border light:border-purple-200 flex items-center justify-center"
            >
              <span className="text-2xl">🎮</span>
            </motion.div>

            <motion.div
              animate={{ 
                y: [0, 15, 0],
                rotate: [0, -3, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute bottom-12 -right-4 w-20 h-20 rounded-full transition-all duration-300 dark:bg-gaming-cyan/20 light:bg-blue-200/30 dark:border dark:border-gaming-cyan/30 light:border light:border-blue-200 flex items-center justify-center"
            >
              <span className="text-3xl">💎</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 