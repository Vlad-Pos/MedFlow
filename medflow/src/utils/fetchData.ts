/**
 * Generic data fetching function with error handling
 */
export async function fetchData<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

/**
 * Fetch data with timeout
 */
export async function fetchDataWithTimeout<T>(
  url: string,
  timeout: number = 5000,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    
    console.error('Error fetching data:', error)
    throw error
  }
}

/**
 * Simple cache implementation for API responses
 */
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private maxAge: number

  constructor(maxAge: number = 5 * 60 * 1000) { // 5 minutes default
    this.maxAge = maxAge
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }
}

// Create a global cache instance
export const apiCache = new SimpleCache()

/**
 * Fetch data with caching
 */
export async function fetchDataWithCache<T>(
  url: string,
  cacheKey?: string,
  options: RequestInit = {}
): Promise<T> {
  const key = cacheKey || url
  
  // Check cache first
  const cached = apiCache.get(key)
  if (cached) {
    return cached
  }

  // Fetch fresh data
  const data = await fetchData<T>(url, options)
  
  // Cache the result
  apiCache.set(key, data)
  
  return data
}

/**
 * POST data to an endpoint
 */
export async function postData<T>(
  url: string,
  data: any,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error posting data:', error)
    throw error
  }
}

/**
 * PUT data to an endpoint
 */
export async function putData<T>(
  url: string,
  data: any,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error putting data:', error)
    throw error
  }
}

/**
 * DELETE data from an endpoint
 */
export async function deleteData<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error deleting data:', error)
    throw error
  }
}

/**
 * Retry function for failed requests
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error as Error
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError!
}
