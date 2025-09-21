'use server'

import { HttpTypes } from '../types'

function buildQueryString(params: Record<string, any>) {
  return Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) =>
      Array.isArray(v)
        ? v.map((val) => `${encodeURIComponent(k)}=${encodeURIComponent(val)}`).join('&')
        : `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    )
    .join('&')
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode = 'us',
  regionId
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  // Use the correct region ID from the Medusa backend
  const defaultRegionId = regionId || 'reg_01JV09T66DC2XB3EM511M8EJXH'
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  const baseURL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const query = buildQueryString({
    limit,
    offset,
    region_id: defaultRegionId,
    fields: '*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags',
    ...queryParams
  })
  const url = `${baseURL}/store/products?${query}`

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey || ''
      },
      cache: 'force-cache'
    })
    const result = await response.json()
    const { products, count } = result
    const nextPage = count > offset + limit ? pageParam + 1 : null
    return {
      response: {
        products,
        count
      },
      nextPage,
      queryParams
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams
    }
  }
}

/**
 * Debug function to test product fetching
 */
// export const debugProducts = async () => {
//   try {
//     const baseURL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
//     const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
//     const url = `${baseURL}/store/products`

//     console.log("Debug: Fetching from URL:", url)

//     const response = await fetch(url, {
//       headers: {
//         'Content-Type': 'application/json',
//         'x-publishable-api-key': publishableKey || '',
//       }
//     })
//     const data = await response.json()

//     console.log("Debug: Total products found:", data.count)
//     console.log("Debug: First few products:", data.products?.slice(0, 3).map((p: any) => ({
//       id: p.id,
//       title: p.title,
//       description: p.description
//     })))

//     return data
//   } catch (error) {
//     console.error("Debug: Error fetching products:", error)
//     return null
//   }
// }

export const debugProducts = async () => {
  try {
    const baseURL = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000').replace(
      /\/$/,
      ''
    )
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const url = `${baseURL}/store/products?limit=3`

    console.log('[debugProducts] GET:', url)
    if (!publishableKey) {
      console.warn('[debugProducts] WARNING: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is missing')
    }
    console.log('------publishable key: ', publishableKey)

    const res = await fetch(url, {
      headers: {
        'content-type': 'application/json',
        'x-publishable-api-key': publishableKey || '',
        // If your backend expects the older header name, try this instead:
        'x-publishable-key': publishableKey || ''
      },
      cache: 'no-store' // avoid Next.js caching
      // next: { revalidate: 0 }
    })

    const contentType = res.headers.get('content-type') || ''
    let body: any
    try {
      body = contentType.includes('application/json') ? await res.json() : await res.text()
    } catch {
      body = '<< failed to parse body >>'
    }

    // console.log('[debugProducts] status:', res.status, res.statusText)
    // console.log('[debugProducts] redirected:', res.redirected, 'finalUrl:', res.url)
    // console.log('[debugProducts] content-type:', contentType)
    // console.log(
    //   '[debugProducts] body:',
    //   typeof body === 'string' ? body.slice(0, 500) : JSON.stringify(body, null, 2)
    // )

    if (!res.ok || typeof body !== 'object') {
      throw new Error(`Store API failed (${res.status}). Check logs above.`)
    }

    // console.log('[debugProducts] count:', body.count)
    // console.log(
    //   '[debugProducts] first3:',
    //   body.products?.slice(0, 3)?.map((p: any) => ({ id: p.id, title: p.title }))
    // )
    return body
  } catch (error) {
    console.error('[debugProducts] Error:', error)
    return null
  }
}

/**
 * Fetch products and filter for gift cards only using Medusa's built-in search
 */
export const listGiftCardProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode = 'us'
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 50
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  // Use the correct region ID from the Medusa backend
  const defaultRegionId = process.env.MAIN_REGION_ID
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  const baseURL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
  const query = buildQueryString({
    limit: 100, // Get more products for debugging
    region_id: defaultRegionId,
    fields: '*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags'
  })
  const url = `${baseURL}/store/products?${query}`

  try {
    // First, let's try without the search parameter to see all products
    console.log('Debug: Fetching all products first...')
    const allProductsResponse = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey || ''
      },
      cache: 'no-store'
    })
    const allProductsResult = await allProductsResponse.json()

    console.log('Debug: Total products in database:', allProductsResult.count)
    console.log(
      'Debug: Product titles:',
      allProductsResult.products?.map((p: any) => p.title)
    )

    // Now try with the search parameter
    console.log("Debug: Fetching with 'Gift Card' search...")
    const searchQuery = buildQueryString({
      limit,
      offset,
      region_id: defaultRegionId,
      fields: '*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags',
      q: 'Gift Card',
      ...queryParams
    })
    const searchUrl = `${baseURL}/store/products?${searchQuery}`
    const resultResponse = await fetch(searchUrl, {
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableKey || ''
      },
      cache: 'no-store'
    })
    const result = await resultResponse.json()

    // console.log('Debug: Products found with search:', result.count)
    // console.log(
    //   'Debug: Searched product titles:',
    //   result.products?.map((p: any) => p.title)
    // )

    const { products, count } = result
    // console.log('Debug: Products found with search:', result.products)
    const nextPage = count > offset + limit ? pageParam + 1 : null

    // Additional client-side filtering for edge cases
    const giftCardProducts = products.filter(
      (product: any) =>
        product.title?.toLowerCase().includes('gift card') ||
        product.title?.toLowerCase().includes('giftcard') ||
        product.title?.toLowerCase().includes('voucher') ||
        product.metadata?.is_giftcard === true ||
        product.description?.toLowerCase().includes('gift card') ||
        product.description?.toLowerCase().includes('giftcard')
    )

    // console.log('Debug: Final gift card products after filtering:', giftCardProducts.length)
    // console.log(
    //   'Debug: Final product titles:',
    //   giftCardProducts.map((p: any) => p.title)
    // )

    // console.log(products, count, 'ttttttttttttttttttttttttttttttttttttttttt')
    return {
      response: {
        products: products,
        count: count
      },
      nextPage,
      queryParams
    }
  } catch (error) {
    console.error('Error fetching gift card products:', error)
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams
    }
  }
}
