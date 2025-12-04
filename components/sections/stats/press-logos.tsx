'use client'

export function PressLogos() {
  // Placeholder logos using text - in production these would be actual images
  const outlets = [
    { name: 'Forbes', emphasis: true },
    { name: 'TechCrunch', emphasis: false },
    { name: 'Wired', emphasis: false },
    { name: 'The Verge', emphasis: false },
    { name: 'Mashable', emphasis: false },
    { name: 'Product Hunt', emphasis: true },
    { name: 'Good Housekeeping', emphasis: false },
    { name: 'Martha Stewart', emphasis: false },
  ]
  
  return (
    <section className="py-16 bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
          As Seen In
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {outlets.map((outlet, index) => (
            <div
              key={index}
              className={`text-2xl md:text-3xl font-bold transition-colors ${
                outlet.emphasis 
                  ? 'text-gray-500 hover:text-gray-700' 
                  : 'text-gray-300 hover:text-gray-500'
              }`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {outlet.name}
            </div>
          ))}
        </div>
        
        {/* Optional: Featured quote */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <blockquote className="text-xl text-gray-600 italic">
            &ldquo;SoundPrints turns your favorite moments into stunning art pieces. A must-have for meaningful gift-giving.&rdquo;
          </blockquote>
          <cite className="block mt-4 text-gray-400 not-italic">— Forbes, Best Gifts 2024</cite>
        </div>
      </div>
    </section>
  )
}

// Partner logos section
export function PartnerLogos() {
  const partners = [
    { name: 'Spotify', description: 'Music Integration' },
    { name: 'Apple Music', description: 'Song Search' },
    { name: 'Printful', description: 'Print Partner' },
    { name: 'Stripe', description: 'Secure Payments' },
    { name: 'Shopify', description: 'Commerce' },
    { name: 'UPS', description: 'Shipping' },
  ]
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
            Trusted Partners
          </h3>
          <p className="text-gray-600">
            We work with industry leaders to deliver the best experience
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="text-lg font-bold text-gray-700 mb-1">
                {partner.name}
              </div>
              <div className="text-xs text-gray-400">
                {partner.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
