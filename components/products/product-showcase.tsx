'use client'

import { motion } from 'framer-motion'
import { Frame, Shirt, Coffee, Palette, Layers } from 'lucide-react'

const products = [
  {
    name: 'Poster',
    icon: Frame,
    description: 'Premium quality prints',
    price: '$29.99',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'T-Shirt',
    icon: Shirt,
    description: 'Soft premium cotton',
    price: '$34.99',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Mug',
    icon: Coffee,
    description: 'Ceramic 11oz or 15oz',
    price: '$19.99',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    name: 'Canvas',
    icon: Palette,
    description: 'Gallery-wrapped canvas',
    price: '$49.99',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Hoodie',
    icon: Layers,
    description: 'Cozy fleece hoodie',
    price: '$49.99',
    gradient: 'from-indigo-500 to-purple-500',
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
              <div className="bg-card border rounded-lg p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${product.gradient} mb-4 group-hover:scale-110 transition-transform`}
                >
                  <product.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold mb-1">{product.name}</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {product.description}
                </p>
                <p className="text-sm font-bold text-primary">{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
