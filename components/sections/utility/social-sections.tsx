'use client'

import { 
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  Music2,
  MessageCircle,
  Share2,
  Copy,
  Check,
  Mail
} from 'lucide-react'
import { useState } from 'react'

// Social Links Bar
export function SocialLinksBar() {
  const socials = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/soundprints', color: 'hover:bg-blue-600' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/soundprints', color: 'hover:bg-pink-600' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/soundprints', color: 'hover:bg-sky-500' },
    { name: 'Youtube', icon: Youtube, href: 'https://youtube.com/soundprints', color: 'hover:bg-red-600' },
    { name: 'TikTok', icon: Music2, href: 'https://tiktok.com/@soundprints', color: 'hover:bg-gray-800' },
    { name: 'Pinterest', icon: MessageCircle, href: 'https://pinterest.com/soundprints', color: 'hover:bg-red-500' }
  ]

  return (
    <div className="flex items-center gap-4">
      {socials.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-full bg-gray-100 text-gray-600 hover:text-white transition-colors ${social.color}`}
          aria-label={social.name}
        >
          <social.icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  )
}

// Social Follow Section
export function SocialFollowSection() {
  const socials = [
    { name: 'Instagram', icon: Instagram, href: '#', followers: '15.2K', color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' },
    { name: 'Facebook', icon: Facebook, href: '#', followers: '8.5K', color: 'bg-blue-600' },
    { name: 'TikTok', icon: Music2, href: '#', followers: '23.1K', color: 'bg-gray-900' },
    { name: 'Pinterest', icon: MessageCircle, href: '#', followers: '5.2K', color: 'bg-red-600' }
  ]

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Follow Us</h2>
        <p className="text-gray-600 mb-8">Join our community for inspiration and exclusive offers</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.href}
              className={`${social.color} text-white rounded-2xl p-6 hover:scale-105 transition-transform`}
            >
              <social.icon className="h-8 w-8 mx-auto mb-3" />
              <p className="font-bold">{social.name}</p>
              <p className="text-white/80 text-sm">{social.followers} followers</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// Share Product Buttons
export function ShareProductButtons({ productUrl, productTitle }: { productUrl: string; productTitle: string }) {
  const [copied, setCopied] = useState(false)

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productTitle)}`,
      color: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      name: 'Pinterest',
      icon: MessageCircle,
      href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&description=${encodeURIComponent(productTitle)}`,
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(productTitle)}&body=${encodeURIComponent(productUrl)}`,
      color: 'bg-gray-600 hover:bg-gray-700'
    }
  ]

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(productUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 mr-2">Share:</span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-lg text-white transition-colors ${link.color}`}
          aria-label={`Share on ${link.name}`}
        >
          <link.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        onClick={copyToClipboard}
        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

// Share Modal
export function ShareModal({ isOpen, onClose, url, title }: {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
}) {
  const [copied, setCopied] = useState(false)

  const shareLinks = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'Twitter', icon: Twitter, color: 'bg-sky-500', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700', href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}` },
    { name: 'Pinterest', icon: MessageCircle, color: 'bg-red-600', href: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}` },
    { name: 'Email', icon: Mail, color: 'bg-gray-600', href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}` },
    { name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500', href: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}` }
  ]

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-rose-500" />
            Share
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className={`w-12 h-12 ${link.color} rounded-full flex items-center justify-center text-white`}>
                <link.icon className="h-6 w-6" />
              </div>
              <span className="text-sm text-gray-600">{link.name}</span>
            </a>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600"
          />
          <button
            onClick={copyLink}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${copied
                ? 'bg-green-500 text-white'
                : 'bg-rose-500 text-white hover:bg-rose-600'
              }`}
          >
            {copied ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Copied!
              </span>
            ) : (
              'Copy'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Social Proof Mini Badge
export function SocialProofBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg">
      <div className="flex -space-x-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500"
          >
            {String.fromCharCode(64 + i)}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600">
        <strong className="text-gray-900">2,500+</strong> happy customers
      </p>
    </div>
  )
}

// Instagram Feed Grid
export function InstagramFeedGrid() {
  const posts = Array(6).fill(null).map((_, i) => ({
    id: i + 1,
    imageUrl: `/gallery/instagram-${i + 1}.jpg`,
    likes: Math.floor(Math.random() * 500) + 100,
    comments: Math.floor(Math.random() * 50) + 10
  }))

  return (
    <div className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Instagram className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold text-gray-900">@soundprints</span>
          </div>
          <a
            href="https://instagram.com/soundprints"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-500 hover:text-rose-600 font-medium"
          >
            Follow Us →
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com/soundprints"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                <span className="flex items-center gap-1">
                  <span>♥</span> {post.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> {post.comments}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
