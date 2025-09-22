'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Gift, 
  User, 
  Wallet, 
  History, 
  Settings,
  ChevronDown,
  Gamepad2,
  ShoppingCart,
  Search
} from './icons'
// import { useCart } from '../lib/cart-context'
import { useSearch } from '../lib/search-context'
import Cart from './Cart'
import ThemeToggle from './ThemeToggle'
import { useCart } from '@/contexts/CartProvider2'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  // const { state } = useCart()
  const { cart } = useCart()
  const state = {
    totalItems: cart?.items?.length
  }
  const { searchTerm, setSearchTerm } = useSearch()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', href: '/', hasDropdown: false },
    { 
      name: 'Gift Cards', 
      href: '/gift-cards', 
      hasDropdown: true,
      dropdownItems: [
        { name: 'All Cards', href: '/gift-cards' },
        { name: 'Steam', href: '/gift-cards?platform=steam' },
        { name: 'Xbox', href: '/gift-cards?platform=xbox' },
        { name: 'PlayStation', href: '/gift-cards?platform=playstation' },
        { name: 'Nintendo', href: '/gift-cards?platform=nintendo' },
        { name: 'Mobile Games', href: '/gift-cards?platform=mobile' },
      ]
    },
    { name: 'Virtual Cards', href: '/virtual-cards', hasDropdown: false },
    { name: 'Checkout', href: '/checkout', hasDropdown: false },
    { name: 'History', href: '/history', hasDropdown: false },
  ]

  const userMenuItems = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Order History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'transition-colors duration-300 dark:bg-gaming-darker/95 dark:backdrop-blur-md dark:border-b dark:border-gaming-purple/30 light:bg-white/95 light:backdrop-blur-md light:border-b light:border-gray-200 light:shadow-lg' 
            : 'bg-transparent'
        }`}
        style={{ zIndex: 9999 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Gamepad2 className="w-8 h-8 transition-colors duration-300 dark:text-gaming-cyan dark:group-hover:text-gaming-neon light:text-blue-600 light:group-hover:text-purple-600" />
                <div className="absolute inset-0 rounded-full blur-lg transition-all duration-300 dark:bg-gaming-cyan/20 dark:group-hover:bg-gaming-neon/30 light:bg-blue-600/20 light:group-hover:bg-purple-600/30" />
              </div>
              <span className="font-gaming text-xl font-bold text-gradient-primary">
                GameVault
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center space-x-1 font-medium transition-colors duration-300 dark:text-gray-300 dark:hover:text-gaming-cyan light:text-gray-700 light:hover:text-blue-600"
                  >
                    <span>{item.name}</span>
                    {item.hasDropdown && (
                      <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.hasDropdown && activeDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 rounded-lg shadow-cyber overflow-hidden transition-colors duration-300 dark:bg-gaming-dark/95 dark:backdrop-blur-md dark:border dark:border-gaming-purple/30 light:bg-white/95 light:backdrop-blur-md light:border light:border-gray-200 light:shadow-xl"
                      >
                        {item.dropdownItems?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-4 py-3 text-sm transition-all duration-300 dark:text-gray-300 dark:hover:text-gaming-cyan dark:hover:bg-gaming-purple/20 light:text-gray-700 light:hover:text-blue-600 light:hover:bg-blue-50"
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search gift cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 text-sm rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 dark:bg-gaming-dark/50 dark:border-gaming-purple/30 dark:text-white dark:placeholder-gray-400 dark:focus:ring-gaming-cyan/50 dark:focus:border-gaming-cyan light:bg-white/80 light:border-gray-200 light:text-gray-900 light:placeholder-gray-500 light:focus:ring-blue-500/50 light:focus:border-blue-500"
              />
            </div>

            {/* User Menu, Cart & CTA */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 transition-colors duration-300 dark:text-gray-300 dark:hover:text-gaming-cyan light:text-gray-700 light:hover:text-blue-600"
              >
                <ShoppingCart className="w-6 h-6" />
                {state.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-colors duration-300 dark:bg-gaming-neon dark:text-gaming-dark light:bg-blue-600 light:text-white">
                    {state.totalItems}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('user')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center space-x-2 transition-colors duration-300 dark:text-gray-300 dark:hover:text-gaming-cyan light:text-gray-700 light:hover:text-blue-600">
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-cyber overflow-hidden transition-colors duration-300 dark:bg-gaming-dark/95 dark:backdrop-blur-md dark:border dark:border-gaming-purple/30 light:bg-white/95 light:backdrop-blur-md light:border light:border-gray-200 light:shadow-xl"
                    >
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-3 text-sm transition-all duration-300 dark:text-gray-300 dark:hover:text-gaming-cyan dark:hover:bg-gaming-purple/20 light:text-gray-700 light:hover:text-blue-600 light:hover:bg-blue-50"
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA Button */}
              <Link href="/gift-cards" className="btn-neon text-sm px-4 py-2">
                <Gift className="w-4 h-4 mr-2" />
                Buy Cards
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme Toggle Mobile */}
              <ThemeToggle />

              {/* Mobile Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 transition-colors duration-300 dark:text-gray-300 dark:hover:text-gaming-cyan light:text-gray-700 light:hover:text-blue-600"
              >
                <ShoppingCart className="w-6 h-6" />
                {state.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-colors duration-300 dark:bg-gaming-neon dark:text-gaming-dark light:bg-blue-600 light:text-white">
                    {state.totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-300 hover:text-gaming-cyan transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gaming-dark/95 backdrop-blur-md border-t border-gaming-purple/30"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search gift cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 dark:bg-gaming-dark/50 dark:border-gaming-purple/30 dark:text-white dark:placeholder-gray-400 dark:focus:ring-gaming-cyan/50 dark:focus:border-gaming-cyan"
                  />
                </div>

                {/* Navigation Items */}
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-gray-300 hover:text-gaming-cyan hover:bg-gaming-purple/20 rounded-lg transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Divider */}
                <div className="border-t border-gaming-purple/30 my-4" />

                {/* User Menu Items */}
                {userMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-2 text-gray-300 hover:text-gaming-cyan hover:bg-gaming-purple/20 rounded-lg transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}

                {/* CTA Button */}
                <div className="pt-4">
                  <Link 
                    href="/gift-cards" 
                    className="btn-neon w-full justify-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Buy Gift Cards
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}