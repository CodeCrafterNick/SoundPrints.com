/**
 * Printify API Client
 * 
 * Docs: https://developers.printify.com/
 */

const PRINTIFY_API_URL = 'https://api.printify.com/v1'
const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID

interface PrintifyProduct {
  id: string
  title: string
  description: string
  blueprint_id: number
  print_provider_id: number
  variants: Array<{
    id: number
    title: string
    price: number
    is_enabled: boolean
  }>
}

interface PrintifyOrder {
  external_id: string
  line_items: Array<{
    product_id?: string
    blueprint_id?: number
    print_provider_id?: number
    variant_id: number
    quantity: number
    print_areas?: {
      front?: string
      back?: string
    }
  }>
  shipping_method: number
  is_printify_express: boolean
  send_shipping_notification: boolean
  address_to: {
    first_name: string
    last_name: string
    email: string
    phone: string
    country: string
    region: string
    address1: string
    address2?: string
    city: string
    zip: string
  }
}

export class PrintifyClient {
  private apiKey: string
  private shopId: string

  constructor() {
    if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
      throw new Error('Printify API key and Shop ID are required')
    }
    this.apiKey = PRINTIFY_API_KEY
    this.shopId = PRINTIFY_SHOP_ID
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${PRINTIFY_API_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`Printify API Error: ${error.message || response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get all products in your shop
   */
  async getProducts() {
    return this.request(`/shops/${this.shopId}/products.json`)
  }

  /**
   * Get a specific product by ID
   */
  async getProduct(productId: string) {
    return this.request(`/shops/${this.shopId}/products/${productId}.json`)
  }

  /**
   * Upload an image to Printify
   * Returns an image ID to use in print areas
   */
  async uploadImage(imageUrl: string, fileName: string) {
    return this.request(`/uploads/images.json`, {
      method: 'POST',
      body: JSON.stringify({
        file_name: fileName,
        url: imageUrl,
      }),
    })
  }

  /**
   * Create a product
   */
  async createProduct(data: {
    title: string
    description: string
    blueprint_id: number
    print_provider_id: number
    variants: Array<{
      id: number
      price: number
      is_enabled: boolean
    }>
    print_areas: Array<{
      variant_ids: number[]
      placeholders: Array<{
        position: string
        images: Array<{
          id: string
          x: number
          y: number
          scale: number
          angle: number
        }>
      }>
    }>
  }) {
    return this.request(`/shops/${this.shopId}/products.json`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Create an order (TEST MODE: set is_printify_express to false)
   * 
   * For testing: is_printify_express: false (won't charge or ship)
   * For production: is_printify_express: true (will charge and ship)
   */
  async createOrder(orderData: Partial<PrintifyOrder>) {
    return this.request(`/shops/${this.shopId}/orders.json`, {
      method: 'POST',
      body: JSON.stringify({
        ...orderData,
        is_printify_express: false, // TEST MODE - won't actually print/ship
      }),
    })
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string) {
    return this.request(`/shops/${this.shopId}/orders/${orderId}.json`)
  }

  /**
   * Calculate shipping costs
   */
  async calculateShipping(data: {
    line_items: Array<{
      product_id: string
      variant_id: number
      quantity: number
    }>
    address_to: {
      country: string
      region: string
      zip: string
    }
  }) {
    return this.request(`/shops/${this.shopId}/orders/shipping.json`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get all print providers
   */
  async getPrintProviders(blueprintId?: number) {
    if (blueprintId) {
      return this.request(`/catalog/blueprints/${blueprintId}/print_providers.json`)
    }
    return this.request('/catalog/print_providers.json')
  }

  /**
   * Get all blueprints (product types)
   */
  async getBlueprints() {
    return this.request('/catalog/blueprints.json')
  }

  /**
   * Get a specific blueprint with all variants and placeholders
   */
  async getBlueprint(blueprintId: number, printProviderId?: number) {
    if (printProviderId) {
      return this.request(`/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`)
    }
    return this.request(`/catalog/blueprints/${blueprintId}.json`)
  }
}

// Export singleton instance
export const printifyClient = new PrintifyClient()
