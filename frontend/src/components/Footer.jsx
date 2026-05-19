import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Globe, MessageCircle, Share2 } from 'lucide-react';

const Footer = () => (
  <footer style={{ background: 'var(--neo-dark)', color: 'white', borderTop: '4px solid #121212', marginTop: '4rem', fontFamily: 'Outfit, sans-serif' }}>
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
      <div>
        <div style={{ background: 'var(--neo-yellow)', border: '3px solid white', padding: '4px 14px', fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.4rem', color: 'var(--neo-dark)', boxShadow: '3px 3px 0px 0px white', display: 'inline-block', marginBottom: '1rem' }}>NgiNep.</div>
        <p style={{ color: '#9ca3af', fontWeight: 500, lineHeight: 1.6, fontSize: '0.875rem', marginBottom: '1rem' }}>Platform pemesanan hotel berbasis microservices terbaik di Indonesia. Cari, pesan, dan bayar dengan mudah!</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[Globe, MessageCircle, Share2].map((Icon, i) => (
            <button key={i} style={{ background: 'none', border: '2px solid #4b5563', padding: '0.5rem', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--neo-yellow)'; e.currentTarget.style.borderColor = 'var(--neo-yellow)'; e.currentTarget.style.color = 'var(--neo-dark)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#4b5563'; e.currentTarget.style.color = '#9ca3af'; }}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', color: 'var(--neo-blue)', letterSpacing: '0.05em', fontSize: '0.9rem', marginBottom: '1rem' }}>Layanan</h3>
        {[
          { text: 'Beranda', to: '/' },
          { text: 'Cari Hotel', to: '/hotels' },
          { text: 'Promo & Diskon', to: '/hotels?sale=true' },
          { text: 'Pesanan Saya', to: '/my-bookings' },
          { text: 'Profil Saya', to: '/profile' }
        ].map(l => (
          <Link key={l.text} to={l.to} style={{ display: 'block', color: '#9ca3af', fontWeight: 500, textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.6rem', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--neo-yellow)'}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>{l.text}</Link>
        ))}
      </div>
      <div>
        <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', color: 'var(--neo-purple)', letterSpacing: '0.05em', fontSize: '0.9rem', marginBottom: '1rem' }}>Perusahaan</h3>
        {[
          { text: 'Tentang Kami', to: '/about' },
          { text: 'Syarat & Ketentuan', to: '#' },
          { text: 'Kebijakan Privasi', to: '#' },
          { text: 'Karir', to: '#' },
          { text: 'Blog', to: '#' }
        ].map(l => (
          <Link key={l.text} to={l.to} style={{ display: 'block', color: '#9ca3af', fontWeight: 500, textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.6rem', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--neo-yellow)'}
            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>{l.text}</Link>
        ))}
      </div>
      <div>
        <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', color: 'var(--neo-orange)', letterSpacing: '0.05em', fontSize: '0.9rem', marginBottom: '1rem' }}>Bantuan & Kontak</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { Icon: MapPin, text: 'Jl. Raya Pariwisata No. 99, Bandung, Jawa Barat' },
            { Icon: Phone, text: '+62 812-3456-7890' },
            { Icon: Mail, text: 'support@ngninep.id' }
          ].map(({ Icon, text }) => (
            <div key={text} style={{ display: 'flex', gap: '0.6rem', color: '#9ca3af', fontSize: '0.875rem', fontWeight: 500, alignItems: 'flex-start' }}>
              <Icon size={16} style={{ color: 'var(--neo-orange)', flexShrink: 0, marginTop: 2 }} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div style={{ borderTop: '3px solid #374151', padding: '1.25rem 1.5rem', background: 'black', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
      <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600 }}>© {new Date().getFullYear()} NgiNep Corp. Semua hak dilindungi undang-undang.</span>
      <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        Dibuat dengan <Heart size={12} style={{ color: 'var(--neo-pink)', fill: 'var(--neo-pink)' }} /> untuk Java Lanjutan
      </span>
    </div>
  </footer>
);

export default Footer;
