'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Frame, Shirt, Coffee, Palette, Layers } from 'lucide-react'

const products = [
  {
    name: 'Poster',
    icon: Frame,
    description: 'Premium quality prints',
    price: '$29.99',
    gradient: 'from-blue-500 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&q=80',
  },
  {
    name: 'T-Shirt',
    icon: Shirt,
    description: 'Soft premium cotton',
    price: '$34.99',
    gradient: 'from-purple-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
  },
  {
    name: 'Mug',
    icon: Coffee,
    description: 'Ceramic 11oz or 15oz',
    price: '$19.99',
    gradient: 'from-orange-500 to-red-500',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&q=80',
  },
  {
    name: 'Canvas',
    icon: Palette,
    description: 'Gallery-wrapped canvas',
    price: '$49.99',
    gradient: 'from-green-500 to-emerald-500',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80',
  },
  {
    name: 'Hoodie',
    icon: Layers,
    description: 'Cozy fleece hoodie',
    price: '$49.99',
    gradient: 'from-indigo-500 to-purple-500',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80',
  },
]

export function ProductShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-4">Choose Your Product</h3>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Transform your audio into beautiful artwork on your choice of premium products
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                </div>
                <div className="p-4 text-center">
                  <h4 className="font-semibold mb-1">{product.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {product.description}
                  </p>
                  <p className="text-sm font-bold text-primary">{product.price}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
