'use client'

import { Search, Tag, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

const categories = [
  { name: 'Ideas & Inspiration', count: 24 },
  { name: 'Wedding', count: 18 },
  { name: 'Baby & Family', count: 15 },
  { name: 'Tips & Tricks', count: 12 },
  { name: 'Stories', count: 22 },
  { name: 'Podcast', count: 8 },
  { name: 'Behind the Scenes', count: 6 },
  { name: 'Product Updates', count: 10 },
]

const popularPosts = [
  { title: '10 Creative Ways to Display Sound Art', views: '12.5K', slug: '#' },
  { title: 'Wedding Vows: A Complete Guide', views: '8.2K', slug: '#' },
  { title: 'How to Record the Perfect Audio', views: '6.8K', slug: '#' },
  { title: 'Memorial Art for Loved Ones', views: '5.4K', slug: '#' },
]

const tags = [
  'Wedding', 'Baby', 'Anniversary', 'Memorial', 'Voice', 'Podcast',
  'Music', 'Heartbeat', 'First Dance', 'Vows', 'Canvas', 'Framed',
  'Gift Ideas', 'DIY', 'Home Decor', 'Customization'
]

interface CategorySidebarProps {
  currentCategory?: string
  onCategorySelect?: (category: string) => void
}

export function CategorySidebar({ currentCategory, onCategorySelect }: CategorySidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>
      
      {/* Categories */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.name}>
              <button
                onClick={() => onCategorySelect?.(category.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentCategory === category.name
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{category.name}</span>
                <span className="text-gray-400">({category.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Popular Posts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-rose-500" />
          <h3 className="font-bold text-gray-900">Popular Posts</h3>
        </div>
        <ul className="space-y-4">
          {popularPosts.map((post, index) => (
            <li key={index}>
              <a href={post.slug} className="group flex items-start gap-3">
                <span className="text-2xl font-bold text-gray-200 group-hover:text-rose-300 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 group-hover:text-rose-500 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <span className="text-xs text-gray-400">{post.views} views</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Tags */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-rose-500" />
          <h3 className="font-bold text-gray-900">Popular Tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      {/* Newsletter CTA */}
      <div className="bg-gradient-to-br from-rose-500 to-amber-500 rounded-2xl p-6 text-white">
        <h3 className="font-bold text-xl mb-2">Stay Updated</h3>
        <p className="text-rose-100 text-sm mb-4">
          Get the latest articles, tips, and inspiration delivered to your inbox.
        </p>
        <input
          type="email"
          placeholder="Your email"
          className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm placeholder-white/60 text-white border border-white/30 focus:outline-none focus:border-white mb-3"
        />
        <Button className="w-full bg-white text-rose-500 hover:bg-gray-100">
          Subscribe
        </Button>
      </div>
    </aside>
  )
}
