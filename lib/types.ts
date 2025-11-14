export interface Product {
  id: string
  name: string
  description: string
  basePrice: number
  sizes: string[]
  category: 'wall-art' | 'apparel' | 'accessories'
}

export interface PrintFile {
  url: string
  width: number
  height: number
  dpi: number
  format: 'png' | 'pdf'
}

export interface Order {
  id: string
  userId: string
  productId: string
  size: string
  waveformColor: string
  backgroundColor: string
  customText?: string
  printFileUrl: string
  status: 'pending' | 'processing' | 'printing' | 'shipped' | 'delivered'
  createdAt: Date
  updatedAt: Date
}

export interface AudioMetadata {
  duration: number
  fileName: string
  fileSize: number
  mimeType: string
}
