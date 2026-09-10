import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { robotixProfile } from '@/lib/robotix-profile';

export default function InstitutionalFooter() {
  return (
    <footer className="bg-[#0b1d33] px-6 py-16 text-white sm:px-10 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div><Image src="/images/logo-white.png" alt="Robotix Institute" width={210} height={60} className="h-12 w-auto object-contain" /><p className="mt-6 max-w-md text-sm leading-7 text-white/60">Robotics, computing, and practical STEM education for young people, schools, and communities across Zambia.</p><div className="mt-6 flex gap-3"><a href={robotixProfile.facebook} target="_blank" rel="noreferrer" aria-label="Robotix Institute on Facebook" className="flex h-10 w-10 items-center justify-center border border-white/20 text-white/70 hover:border-white hover:text-white"><Facebook className="h-4 w-4" /></a><a href={robotixProfile.instagram} target="_blank" rel="noreferrer" aria-label="Robotix Institute on Instagram" className="flex h-10 w-10 items-center justify-center border border-white/20 text-white/70 hover:border-white hover:text-white"><Instagram className="h-4 w-4" /></a></div></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4b36f]">Institute</p>
            <div className="mt-5 flex flex-col gap-3 text-sm text-white/65"><Link href="/about" className="hover:text-white">About</Link><Link href="/courses" className="hover:text-white">Programs</Link><Link href="/projects" className="hover:text-white">Student work</Link><Link href="/partners" className="hover:text-white">School partnerships</Link><Link href="/contact" className="hover:text-white">Contact</Link></div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d4b36f]">Visit and contact</p>
            <div className="mt-5 space-y-4 text-sm leading-6 text-white/65"><p className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 flex-none text-[#d4b36f]" />{robotixProfile.address}</p><a href="mailto:info@robotixinstitute.io" className="flex gap-3 hover:text-white"><Mail className="mt-0.5 h-4 w-4 flex-none text-[#d4b36f]" />info@robotixinstitute.io</a><a href="tel:+260956355117" className="flex gap-3 hover:text-white"><Phone className="mt-0.5 h-4 w-4 flex-none text-[#d4b36f]" />+260 956 355 117</a></div>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Robotix Institute Zambia. All rights reserved.</p><div className="flex gap-6"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link></div></div>
      </div>
    </footer>
  );
}
