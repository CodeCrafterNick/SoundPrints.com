// Section Components Index
// Re-export all section components for easy imports

// Homepage Sections
export * from './homepage'

// Hero Sections
export * from './hero'

// Feature Sections  
export { 
  HowItWorks as FeaturesHowItWorks,
  FeatureGrid,
  BenefitsHighlights,
  AnimatedReveal,
  ComparisonSection
} from './features'

// Product Sections
export * from './products'

// Testimonial Sections
export * from './testimonials'

// CTA Sections
export * from './cta'

// Header Variations
export * from './headers'

// Footer Variations
export * from './footers'

// Gallery Sections
export * from './gallery'

// Gift Guide Sections
export * from './gift-guide'

// How It Works Sections
export * from './how-it-works'

// About Page Sections
export * from './about'

// Blog Sections
export * from './blog'

// Stats & Social Proof
export { 
  PressLogos as StatsPressLogos,
  PartnerLogos,
  StatsSection,
  StatsSectionDark,
  InstagramFeed
} from './stats'

// UI Components - Import directly from './ui-components' to avoid duplicates with homepage
// Exports: TrustBadges, TrustBadgesCompact, PaymentIcons, GuaranteeBanner, SecuritySeals,
//          ToastProvider, useToast, Breadcrumb, SocialShareButtons, Modal, SizeGuideModal, etc.

// Wholesale Page Sections
export * from './wholesale'

// Affiliate Page Sections
export {
  AffiliateHero,
  AffiliateBenefits,
  AffiliateTestimonials,
  AffiliateResources,
  CommissionStructure,
  CommissionCalculator,
  HowItWorks as AffiliateHowItWorks,
  AffiliateSignupForm,
  AffiliateSignupSimple
} from './affiliate'

// Reviews Page Sections
export * from './reviews'

// FAQ Sections
export * from './faq'

// Press Page Sections
export { 
  PressLogos,
  PressHero,
  PressFeatures,
  PressQuotes,
  PressKit,
  PressContact
} from './press'

// Careers Page Sections
export * from './careers'

// Compare Page Sections
export * from './compare'

// Product Detail Sections
export * from './product-detail'

// Loading States
export * from './loading'

// Banner Components
export * from './banners'

// Cart Components
export * from './cart'

// Checkout Sections
export * from './checkout-sections'

// Account & Dashboard Sections
export * from './account'

// Utility Components
export { 
  SizeGuideModal,
  SizeSelector,
  ProductTypeComparison,
  ZoomControls,
  ShippingCalculator,
  ShippingInfoSection,
  DeliveryEstimate,
  ShippingTracker,
  FreeShippingBanner,
  MobileNavDrawer,
  MegaMenuDropdown,
  Breadcrumbs as UtilityBreadcrumbs,
  CategoryNavPills,
  TabNavigation,
  SearchBar,
  SearchWithSuggestions,
  NewsletterForm,
  ContactForm,
  PasswordInput,
  FormError,
  FormSuccess,
  NotificationPreferences,
  NotificationToggle,
  UnsubscribePreferences,
  NotificationBell,
  SocialLinksBar,
  SocialFollowSection,
  ShareProductButtons,
  ShareModal,
  SocialProofBadge,
  InstagramFeedGrid
} from './utility'
