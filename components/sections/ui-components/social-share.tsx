'use client'

import { useState } from 'react'
import { Copy, Check, Facebook, Twitter, Linkedin, Mail, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SocialShareProps {
  url: string
  title: string
  description?: string
}

export function SocialShareButtons({ url, title, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description || '')
  
  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-600 hover:text-white',
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:bg-sky-500 hover:text-white',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
      color: 'hover:bg-blue-700 hover:text-white',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'hover:bg-green-500 hover:text-white',
    },
    {
      name: 'Email',
      icon: Mail,
      href: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      color: 'hover:bg-gray-700 hover:text-white',
    },
  ]
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }
  
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-700">Share this design</p>
      
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((link) => {
          const Icon = link.icon
          return (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all ${link.color}`}
              aria-label={`Share on ${link.name}`}
            >
              <Icon className="h-5 w-5" />
            </a>
          )
        })}
      </div>
      
      {/* Copy link */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={url}
          readOnly
          className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 truncate"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="flex-shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1 text-emerald-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Compact share buttons (icons only)
export function SocialShareCompact({ url, title }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  
  return (
    <div className="flex items-center gap-1">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
      >
        <Facebook className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-400 hover:text-sky-500 transition-colors"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Mail className="h-4 w-4" />
      </a>
    </div>
  )
}
