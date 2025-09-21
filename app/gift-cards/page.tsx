import { Suspense } from 'react'
import { listGiftCardProducts, debugProducts } from '../../lib/data/products'
import GiftCardGrid from '../../components/GiftCardGrid'
import RealGiftCardGrid from '../../components/RealGiftCardGrid'
import { HttpTypes } from '../../lib/types'

export default async function GiftCardsPage() {
  // Debug: Test product fetching
  console.log('---------------------------')
  console.log('Debug: Starting gift cards page...')
  await debugProducts()

  // Fetch real gift card products
  let giftCardProducts: HttpTypes.StoreProduct[] = []
  let error: Error | null = null

  try {
    console.log('Debug: Fetching gift card products...')
    const result = await listGiftCardProducts({
      countryCode: 'us',
      queryParams: {
        limit: 50
      }
    })
    giftCardProducts = result.response.products
    console.log('Debug: Gift card products fetched:', giftCardProducts.length)

    // Log detailed product information
    console.log('Debug: Detailed product information:')
    giftCardProducts.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product.id,
        title: product.title,
        subtitle: product.subtitle,
        external_id: product.external_id,
        description: product.description,
        platform: product.metadata?.platform,
        price: product.variants?.[0]?.calculated_price?.calculated_amount,
        currency: product.variants?.[0]?.calculated_price?.currency_code
      })
    })
  } catch (err) {
    console.error('Error fetching gift card products:', err)
    error = err as Error
  }

  return (
    <main className='min-h-screen transition-colors duration-500 dark:bg-gaming-darker light:bg-gradient-to-br light:from-blue-50/80 light:via-white light:to-purple-50/80 relative overflow-hidden'>
      {/* Background Effects */}
      <div className='absolute inset-0 pointer-events-none'>
        {/* Dark theme background */}
        <div className='dark:block hidden absolute inset-0 bg-gradient-to-br from-gaming-purple/10 via-transparent to-gaming-cyan/10' />
        <div className='dark:block hidden absolute top-1/4 left-10 w-72 h-72 bg-gaming-purple/5 rounded-full blur-3xl animate-pulse' />
        <div
          className='dark:block hidden absolute bottom-1/4 right-10 w-96 h-96 bg-gaming-cyan/5 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '2s' }}
        />

        {/* Light theme background */}
        <div className='light:block hidden absolute top-1/4 left-10 w-72 h-72 bg-blue-200/15 rounded-full blur-3xl animate-pulse' />
        <div
          className='light:block hidden absolute bottom-1/4 right-10 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl animate-pulse'
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className='relative z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl md:text-6xl font-gaming font-bold mb-4'>
              <span className='cyber-text'>Premium</span>
              <span className='transition-colors duration-300 dark:text-white light:text-gray-900'>
                {' '}
                Gift Cards
              </span>
            </h1>
            <p className='text-xl max-w-2xl mx-auto transition-colors duration-300 dark:text-gray-300 light:text-gray-600'>
              Choose from our extensive collection of gaming gift cards. All purchases are instant
              and secure with cryptocurrency payments.
            </p>
          </div>

          {/* Show real products if available, otherwise fallback to mock data */}
          {error ? (
            <div className='text-center py-12'>
              <div className='bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto'>
                <h3 className='text-red-400 font-semibold mb-2'>Connection Error</h3>
                <p className='text-red-300 text-sm mb-4'>
                  Unable to connect to the product database. Please check your backend connection.
                </p>
                <p className='text-gray-400 text-xs'>Showing demo products instead.</p>
              </div>
              <div className='mt-8'>
                <GiftCardGrid />
              </div>
            </div>
          ) : giftCardProducts.length > 0 ? (
            <Suspense
              fallback={
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className='animate-pulse'>
                      <div className='bg-gray-300 dark:bg-gray-700 h-48 rounded-t-2xl'></div>
                      <div className='p-4 space-y-3'>
                        <div className='h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4'></div>
                        <div className='h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2'></div>
                        <div className='h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3'></div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            >
              <RealGiftCardGrid products={giftCardProducts} />
            </Suspense>
          ) : (
            <div className='text-center py-12'>
              <div className='bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 max-w-md mx-auto'>
                <h3 className='text-yellow-400 font-semibold mb-2'>No Gift Cards Found</h3>
                <p className='text-yellow-300 text-sm mb-4'>
                  No gift card products are currently available in the database.
                </p>
                <p className='text-gray-400 text-xs mb-4'>Showing demo products instead.</p>
                <div className='text-left text-xs text-gray-500'>
                  <p>Debug Info:</p>
                  <p>
                    • Backend URL:{' '}
                    {process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}
                  </p>
                  <p>• Search Term: "Gift Card"</p>
                  <p>• Products Found: {giftCardProducts.length}</p>
                </div>
              </div>
              <div className='mt-8'>
                <GiftCardGrid />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
