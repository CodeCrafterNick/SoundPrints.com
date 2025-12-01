'use client'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle } from 'lucide-react'

const faqCategories = [
  {
    title: 'Getting Started',
    faqs: [
      {
        question: 'What is SoundPrints?',
        answer: 'SoundPrints transforms your audio files into beautiful, personalized soundwave artwork. Upload any audio—your favorite song, a voice message, your baby\'s first words—and we\'ll create a unique visual representation that you can print on posters, canvas, apparel, and more.'
      },
      {
        question: 'What audio formats do you accept?',
        answer: 'We accept most common audio formats including MP3, WAV, M4A, AAC, OGG, and FLAC. Files should be under 50MB in size. If you have a different format, try converting it to MP3 before uploading.'
      },
      {
        question: 'Can I use copyrighted music?',
        answer: 'You can create personal products using any audio you own or have rights to. However, you are responsible for ensuring you have the right to use the audio. For commercial use or resale, you must own the rights to the audio content.'
      },
      {
        question: 'How long can my audio selection be?',
        answer: 'While you can upload longer audio files, we recommend selecting a section between 10 seconds and 3 minutes for the best visual result. You can use our editor to select the exact portion you want to visualize.'
      }
    ]
  },
  {
    title: 'Design & Customization',
    faqs: [
      {
        question: 'Can I customize the colors and style?',
        answer: 'Absolutely! You have complete control over your design. Choose from over 30 waveform styles, set custom colors or gradients for both the waveform and background, add personalized text, and even upload a background image.'
      },
      {
        question: 'What waveform styles are available?',
        answer: 'We offer a wide variety of styles including classic bars, smooth waves, circular designs, mountain peaks, constellation patterns, 3D effects, neon glow, and many more artistic interpretations. Each style creates a unique visual representation of your audio.'
      },
      {
        question: 'Can I add text to my design?',
        answer: 'Yes! You can add a song title, artist name, custom date, or any other text. Choose from various fonts, colors, and positioning options to make your design personal.'
      },
      {
        question: 'Will the preview match the final product?',
        answer: 'We strive to make the preview as accurate as possible. However, there may be slight variations in color between your screen and the printed product due to differences in display calibration and printing processes.'
      }
    ]
  },
  {
    title: 'Products & Printing',
    faqs: [
      {
        question: 'What products do you offer?',
        answer: 'We offer a range of products including premium posters, stretched canvas prints, framed posters, t-shirts, hoodies, mugs, and more. Each product is printed on-demand using high-quality materials.'
      },
      {
        question: 'What sizes are available?',
        answer: 'Available sizes vary by product. Posters range from 12"×16" to 24"×36". Canvas prints come in various sizes from 8"×10" to 30"×40". Apparel is available in sizes XS through 3XL depending on the item.'
      },
      {
        question: 'What is the print quality?',
        answer: 'We partner with premium print-on-demand providers who use archival-quality inks and materials. Posters are printed on 200gsm matte paper, canvas is museum-quality with fade-resistant inks, and apparel uses DTG printing for vibrant, long-lasting designs.'
      },
      {
        question: 'Are frames included with framed posters?',
        answer: 'Yes, framed posters come complete with the frame, printed poster, and protective glass or acrylic front. Ready to hang right out of the box.'
      }
    ]
  },
  {
    title: 'Orders & Shipping',
    faqs: [
      {
        question: 'How long does production take?',
        answer: 'Production typically takes 2-5 business days. Your product is printed on-demand specifically for you, ensuring each piece is fresh and made with care.'
      },
      {
        question: 'How long does shipping take?',
        answer: 'Domestic (US) shipping typically takes 5-10 business days after production. International shipping can take 10-20 business days. You\'ll receive tracking information once your order ships.'
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes! We ship to most countries worldwide. Shipping costs and delivery times vary by location. International customers may be responsible for customs duties or taxes.'
      },
      {
        question: 'Can I track my order?',
        answer: 'Yes, you\'ll receive an email with tracking information once your order ships. You can also check your order status by visiting the order confirmation page.'
      },
      {
        question: 'What if my order is lost or damaged?',
        answer: 'If your order is confirmed lost by the carrier or arrives damaged, please contact us within 14 days with photos of the damage. We\'ll send a replacement at no additional cost.'
      }
    ]
  },
  {
    title: 'Returns & Refunds',
    faqs: [
      {
        question: 'What is your return policy?',
        answer: 'Because each product is custom-made, we cannot accept returns for change of mind. However, if your product arrives damaged, defective, or incorrect, we\'ll replace it or issue a refund. See our full refund policy for details.'
      },
      {
        question: 'Can I cancel my order?',
        answer: 'You can cancel within 2 hours of placing your order if production hasn\'t started. After that, cancellations may not be possible as your custom product enters production quickly.'
      },
      {
        question: 'How do I request a refund?',
        answer: 'Contact us through our contact page within 14 days of receiving your order. Include your order number, photos of the issue, and a description of the problem. We\'ll respond within 24-48 hours.'
      }
    ]
  },
  {
    title: 'Privacy & Security',
    faqs: [
      {
        question: 'Is my audio file private?',
        answer: 'Yes, your audio files are handled securely. We only use them to generate your soundwave design and process your order. Audio files are automatically deleted after order fulfillment.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use Stripe for payment processing—your card information is never stored on our servers. All transactions are encrypted with industry-standard SSL/TLS technology.'
      },
      {
        question: 'Do you share my information?',
        answer: 'We only share necessary information with our print partners and shipping carriers to fulfill your order. We never sell your personal information to third parties. See our privacy policy for full details.'
      }
    ]
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about SoundPrints
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-semibold mb-4">{category.title}</h2>
                <Accordion type="single" collapsible className="border rounded-xl">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${categoryIndex}-${faqIndex}`}
                      className="px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center border rounded-2xl p-8 bg-muted/20">
            <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link href="/contact">
              <Button size="lg">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
