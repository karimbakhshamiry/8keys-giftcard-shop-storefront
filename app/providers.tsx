'use client'

import React from 'react'
// @todo.safari, remove it after codes migration
// import { CartProvider } from '../lib/cart-context'
import { ThemeProvider } from '../lib/theme-context'
import { SearchProvider } from '../lib/search-context'
import { AuthProvider } from '../lib/auth-context'
import { RegionProvider } from '@/contexts/RegionProvider'
import { CartProvider2} from '@/contexts/CartProvider2'



export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RegionProvider>
          <CartProvider2>
            <SearchProvider>
              {children}
            </SearchProvider>
          </CartProvider2>
        </RegionProvider>
      </ThemeProvider>
    </AuthProvider>
  )
} 