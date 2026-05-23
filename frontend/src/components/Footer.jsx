import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Globe, MessageCircle, Share2 } from 'lucide-react';

const Footer = () => (
  <footer style={{ background: '#111827', color: '#F9FAFB', borderTop: '1px solid #1F2937', marginTop: '6rem', fontFamily: 'var(--font-body)', fontWeight: 300 }}>
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem' }}>
      
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: '#FFFFFF', letterSpacing: '1px', marginBottom: '1.25rem' }}>
          NgiNep<span style={{ color: 'var(--color-primary)' }}>.</span>
        </div>
        <p style={{ color: '#9CA3AF', lineHeight: 1.7, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Platform kurasi hotel butik dan resort mewah terbaik di Indonesia. Mulai perjalanan kenyamanan Anda hari ini.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[Globe, MessageCircle, Share2].map((Icon, i) => (
            <button key={i} style={{ background: 'transparent', border: '1px solid #374151', width: 36, height: 36, cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease', borderRadius: '50%' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#9CA3AF'; }}>
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF', letterSpacing: '1px', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 400 }}>Layanan</h3>
        {[
          { text: 'Beranda', to: '/' },
          { text: 'Cari Hotel', to: '/hotels' },
          { text: 'Promo & Diskon', to: '/hotels?sale=true' },
          { text: 'Pesanan Saya', to: '/my-bookings' },
          { text: 'Profil Saya', to: '/profile' }
        ].map(l => (
          <Link key={l.text} to={l.to} style={{ display: 'block', color: '#9CA3AF', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.75rem', transition: 'color 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>{l.text}</Link>
        ))}
      </div>

      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF', letterSpacing: '1px', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 400 }}>Perusahaan</h3>
        {[
          { text: 'Tentang Kami', to: '/about' },
          { text: 'Syarat & Ketentuan', to: '#' },
          { text: 'Kebijakan Privasi', to: '#' },
          { text: 'Karir', to: '#' },
          { text: 'Blog', to: '#' }
        ].map(l => (
          <Link key={l.text} to={l.to} style={{ display: 'block', color: '#9CA3AF', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '0.75rem', transition: 'color 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}>{l.text}</Link>
        ))}
      </div>

      <div>
        <h3 style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF', letterSpacing: '1px', fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 400 }}>Hubungi Kami</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { Icon: MapPin, text: 'Jl. Raya Pariwisata No. 99, Bandung' },
            { Icon: Phone, text: '+62 812-3456-7890' },
            { Icon: Mail, text: 'support@ngninep.id' }
          ].map(({ Icon, text }) => (
            <div key={text} style={{ display: 'flex', gap: '0.75rem', color: '#9CA3AF', fontSize: '0.85rem', alignItems: 'flex-start' }}>
              <Icon size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
    
    <div style={{ borderTop: '1px solid #1F2937', padding: '1.5rem', background: '#0F172A', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
      <span style={{ color: '#6B7280', fontSize: '0.75rem' }}>© {new Date().getFullYear()} NgiNep Corp. All rights reserved.</span>
      <span style={{ color: '#6B7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        Made with <Heart size={10} style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }} /> for Java Lanjutan
      </span>
    </div>
  </footer>
);

export default Footer;
