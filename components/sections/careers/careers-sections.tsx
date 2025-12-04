'use client'

import { useState } from 'react'
import { 
  Briefcase, MapPin, Clock, DollarSign, Users, Heart, Zap, Coffee,
  ChevronRight, ArrowRight, CheckCircle, Globe, Building2, Sparkles
} from 'lucide-react'

interface JobListing {
  id: string
  title: string
  department: string
  location: string
  type: string
  salary: string
  posted: string
  description: string
  requirements: string[]
}

const jobListings: JobListing[] = [
  {
    id: '1',
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    salary: '$150K - $180K',
    posted: '2 days ago',
    description: 'Join our engineering team to build the next generation of our sound visualization platform.',
    requirements: [
      '5+ years of experience with React and Node.js',
      'Experience with TypeScript and PostgreSQL',
      'Strong understanding of audio processing concepts',
      'Excellent communication skills'
    ]
  },
  {
    id: '2',
    title: 'Product Designer',
    department: 'Design',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$120K - $150K',
    posted: '1 week ago',
    description: 'Help design beautiful, intuitive experiences that delight our customers.',
    requirements: [
      '4+ years of product design experience',
      'Expert in Figma and design systems',
      'Portfolio demonstrating strong visual design skills',
      'Experience with e-commerce or creative tools'
    ]
  },
  {
    id: '3',
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Remote (US)',
    type: 'Full-time',
    salary: '$80K - $100K',
    posted: '3 days ago',
    description: 'Be the voice of our customers and help them create meaningful memories.',
    requirements: [
      '3+ years in customer success or support',
      'Excellent written and verbal communication',
      'Experience with CRM tools',
      'Passion for helping customers'
    ]
  },
  {
    id: '4',
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    salary: '$110K - $140K',
    posted: '5 days ago',
    description: 'Drive customer acquisition and brand awareness through innovative marketing strategies.',
    requirements: [
      '4+ years in growth marketing',
      'Experience with paid social and search',
      'Data-driven decision making',
      'Experience in D2C or e-commerce'
    ]
  },
  {
    id: '5',
    title: 'Operations Coordinator',
    department: 'Operations',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$55K - $70K',
    posted: '1 week ago',
    description: 'Help streamline our production and fulfillment processes.',
    requirements: [
      '2+ years in operations or logistics',
      'Strong organizational skills',
      'Experience with inventory management',
      'Detail-oriented and proactive'
    ]
  }
]

const departments = ['All', 'Engineering', 'Design', 'Marketing', 'Customer Success', 'Operations']

export function CareersHero() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
          <Briefcase className="h-4 w-4" />
          <span className="text-sm font-medium">We're Hiring!</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Join the Team
          <span className="block text-yellow-300">Making Memories</span>
        </h1>

        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
          Help us transform meaningful moments into lasting art. We're building the future of personalized gifts.
        </p>

        <a
          href="#positions"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-rose-500 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          View Open Positions
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </section>
  )
}

export function CareersPerks() {
  const perks = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Comprehensive Benefits',
      description: 'Health, dental, vision insurance plus 401(k) matching'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Remote-First Culture',
      description: 'Work from anywhere with flexible hours'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Learning Budget',
      description: '$2,000/year for courses, books, and conferences'
    },
    {
      icon: <Coffee className="h-6 w-6" />,
      title: 'Unlimited PTO',
      description: 'Take the time you need to recharge'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Retreats',
      description: 'Annual all-company gatherings in fun locations'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Product Discount',
      description: 'Free and discounted SoundPrints for you and family'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why You'll Love Working Here</h2>
          <p className="text-gray-600">We take care of our team so they can take care of our customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {perks.map((perk, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-rose-100 rounded-xl text-rose-500">
                  {perk.icon}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{perk.title}</h3>
                <p className="text-gray-600 text-sm">{perk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CareersValues() {
  const values = [
    {
      title: 'Customer Obsession',
      description: 'We start with the customer and work backwards. Every decision is made with their joy in mind.'
    },
    {
      title: 'Move Fast & Build',
      description: 'We ship quickly, learn from our mistakes, and iterate. Perfect is the enemy of good.'
    },
    {
      title: 'Radical Transparency',
      description: 'We share context openly so everyone can make great decisions. No politics, no gatekeeping.'
    },
    {
      title: 'Own Your Impact',
      description: 'Take initiative and ownership. Your ideas matter and can change the direction of the company.'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-gray-600">The principles that guide everything we do</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <span className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
              </div>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CareersListings() {
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [expandedJob, setExpandedJob] = useState<string | null>(null)

  const filteredJobs = jobListings.filter(
    job => selectedDepartment === 'All' || job.department === selectedDepartment
  )

  return (
    <section className="py-20 bg-white" id="positions">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
          <p className="text-gray-600">Find your perfect role and grow with us</p>
        </div>

        {/* Department Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedDepartment === dept
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-gray-50 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                className="w-full p-6 text-left hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className="px-2 py-1 bg-rose-100 text-rose-600 text-xs font-medium rounded-full">
                        {job.department}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {job.salary}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-6 w-6 text-gray-400 transition-transform ${
                      expandedJob === job.id ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedJob === job.id && (
                <div className="px-6 pb-6">
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    
                    <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                    <ul className="space-y-2 mb-6">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          {req}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={`/careers/${job.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
                    >
                      Apply for this Position
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No open positions in this department right now.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export function CareersNoOpenings() {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Don&apos;t See the Right Role?</h2>
        <p className="text-gray-400 mb-6">
          We're always looking for exceptional people. Send us your resume and we'll keep you in mind for future opportunities.
        </p>
        <a
          href="mailto:careers@soundprints.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
        >
          Send Your Resume
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </section>
  )
}
