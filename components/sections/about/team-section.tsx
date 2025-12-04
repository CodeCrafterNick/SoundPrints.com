'use client'

import { Twitter, Linkedin, Mail } from 'lucide-react'

interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  image?: string
  socials: {
    twitter?: string
    linkedin?: string
    email?: string
  }
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Founder & CEO',
    bio: 'Former sound engineer with a passion for transforming audio into visual art. Started SoundPrints after creating a waveform print of her parents\' wedding song.',
    socials: { twitter: '#', linkedin: '#', email: 'sarah@soundprints.com' },
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    role: 'CTO',
    bio: 'Full-stack developer and audio processing expert. Built our proprietary waveform generation engine from scratch.',
    socials: { twitter: '#', linkedin: '#' },
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Head of Design',
    bio: 'Award-winning graphic designer specializing in data visualization. Creates our waveform styles and product templates.',
    socials: { linkedin: '#', email: 'emily@soundprints.com' },
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Production Manager',
    bio: 'Print industry veteran with 15+ years experience. Ensures every print meets our quality standards.',
    socials: { linkedin: '#' },
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Customer Experience Lead',
    bio: 'Dedicated to making every customer interaction memorable. Leads our support team with empathy and efficiency.',
    socials: { twitter: '#', email: 'lisa@soundprints.com' },
  },
  {
    id: 6,
    name: 'Alex Patel',
    role: 'Marketing Director',
    bio: 'Storyteller at heart. Helps share the meaningful stories behind every SoundPrint created by our customers.',
    socials: { twitter: '#', linkedin: '#' },
  },
]

export function TeamSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Passionate people dedicated to turning your favorite sounds into lasting memories
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              {/* Avatar placeholder */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                {/* Status indicator */}
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              
              {/* Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-rose-500 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{member.bio}</p>
                
                {/* Social links */}
                <div className="flex justify-center gap-3">
                  {member.socials.twitter && (
                    <a 
                      href={member.socials.twitter}
                      className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                  )}
                  {member.socials.linkedin && (
                    <a 
                      href={member.socials.linkedin}
                      className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {member.socials.email && (
                    <a 
                      href={`mailto:${member.socials.email}`}
                      className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Join us CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-rose-50 rounded-full px-6 py-4">
            <span className="text-gray-700">Want to join our team?</span>
            <a href="/careers" className="text-rose-500 font-semibold hover:text-rose-600">
              View Open Positions →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
