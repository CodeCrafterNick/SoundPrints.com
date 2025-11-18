/**
 * Printful API Client
 * https://developers.printful.com/docs/
 */

const PRINTFUL_API_URL = 'https://api.printful.com'

export interface PrintfulProduct {
  id: number
  external_id?: string
  name: string
  variants: number
  synced: number
}

export interface PrintfulVariant {
  id: number
  product_id: number
  name: string
  size: string
  color: string
  price: string
  in_stock: boolean
}

export interface PrintfulFile {
  type: 'default' | 'preview' | 'back' | 'front'
  url: string
  filename?: string
  visible?: boolean
}

export interface PrintfulOrderItem {
  variant_id: number
  quantity: number
  files: PrintfulFile[]
  retail_price?: string
}

export interface PrintfulRecipient {
  name: string
  address1: string
  city: string
  state_code: string
  country_code: string
  zip: string
  email?: string
  phone?: string
}

export interface PrintfulOrder {
  external_id?: string
  shipping: string
  recipient: PrintfulRecipient
  items: PrintfulOrderItem[]
  retail_costs?: {
    subtotal: string
    tax: string
    shipping: string
    total: string
  }
}

export class PrintfulClient {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PRINTFUL_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('Printful API key not provided')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${PRINTFUL_API_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(
        `Printful API error: ${response.status} - ${JSON.stringify(error)}`
      )
    }

    const data = await response.json()
    return data.result as T
  }

  /**
   * Get catalog products
   */
  async getCatalogProducts(category?: string): Promise<any[]> {
    let endpoint = '/products'
    if (category) endpoint += `?category_id=${category}`
    return this.request(endpoint)
  }

  /**
   * Get product variants
   */
  async getProductVariants(productId: number): Promise<PrintfulVariant[]> {
    return this.request(`/products/${productId}`)
  }

  /**
   * Get sync products (your store products)
   */
  async getSyncProducts(): Promise<PrintfulProduct[]> {
    return this.request('/store/products')
  }

  /**
   * Create sync product
   */
  async createSyncProduct(data: any): Promise<any> {
    return this.request('/store/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Upload design file
   */
  async uploadFile(fileUrl: string): Promise<{ id: string; url: string }> {
    return this.request('/files', {
      method: 'POST',
      body: JSON.stringify({ url: fileUrl }),
    })
  }

  /**
   * Create order
   */
  async createOrder(order: PrintfulOrder, confirm: boolean = false): Promise<any> {
    return this.request(`/orders${confirm ? '?confirm=1' : ''}`, {
      method: 'POST',
      body: JSON.stringify(order),
    })
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string | number): Promise<any> {
    return this.request(`/orders/${orderId}`)
  }

  /**
   * Calculate shipping rates
   */
  async calculateShipping(order: Partial<PrintfulOrder>): Promise<any> {
    return this.request('/shipping/rates', {
      method: 'POST',
      body: JSON.stringify(order),
    })
  }

  /**
   * Get mockup for variant
   */
  async getMockup(variantId: number, fileUrl: string): Promise<any> {
    return this.request('/mockup-generator/create-task/71', {
      method: 'POST',
      body: JSON.stringify({
        variant_ids: [variantId],
        format: 'jpg',
        files: [
          {
            placement: 'front',
            image_url: fileUrl,
            position: {
              area_width: 1800,
              area_height: 2400,
              width: 1800,
              height: 1800,
              top: 300,
              left: 0,
            },
          },
        ],
      }),
    })
  }
}

export const printfulClient = new PrintfulClient()
