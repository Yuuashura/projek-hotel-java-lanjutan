import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Award, Users } from 'lucide-react';

const About = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--neo-light)', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 900, color: 'var(--neo-orange)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem' }}>Tentang Kami</span>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', textTransform: 'uppercase', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: 1.1 }}>
            Kenalan Lebih Dekat dengan <span style={{ background: 'var(--neo-yellow)', border: '4px solid var(--neo-dark)', padding: '2px 12px', display: 'inline-block', transform: 'rotate(-1deg)', boxShadow: 'var(--neo-shadow-sm)' }}>NgiNep.</span>
          </h1>
          <p style={{ color: '#4b5563', fontWeight: 500, fontSize: '1.1rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Kami adalah platform booking hotel revolusioner yang dirancang khusus untuk mempermudah liburan dan perjalanan bisnis Anda di seluruh Indonesia.
          </p>
        </div>

        {/* Story Section */}
        <div className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.5rem', marginBottom: '1rem' }}>Misi & Visi Kami</h2>
          <p style={{ color: '#374151', fontWeight: 500, lineHeight: 1.8, marginBottom: '1.25rem' }}>
            NgiNep lahir dari visi sederhana: menciptakan ekosistem perjalanan di mana pemesanan akomodasi bukan lagi hal yang rumit dan melelahkan. Kami percaya bahwa setiap petualangan berharga, dan kenyamanan tempat peristirahatan Anda adalah prioritas utama kami.
          </p>
          <p style={{ color: '#374151', fontWeight: 500, lineHeight: 1.8 }}>
            Dengan mengintegrasikan teknologi pencarian pintar, opsi pembayaran yang instan, dan kerja sama erat dengan pengelola hotel lokal, kami berupaya menyajikan pilihan hotel terbaik dengan penawaran harga paling transparan tanpa biaya tambahan tersembunyi.
          </p>
        </div>

        {/* Value Grid */}
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.5rem', textAlign: 'center', marginBottom: '2rem' }}>Nilai Utama Kami</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3.5rem' }}>
          {[
            { icon: ShieldCheck, color: 'var(--neo-green)', title: 'Kepercayaan Penuh', desc: 'Kami menjamin keamanan setiap transaksi Anda dengan sistem verifikasi modern yang transparan.' },
            { icon: Heart, color: 'var(--neo-pink)', title: 'Fokus Pelanggan', desc: 'Kepuasan dan kenyamanan menginap Anda adalah roda penggerak utama inovasi platform kami.' },
            { icon: Award, color: 'var(--neo-yellow)', title: 'Kualitas Terkurasi', desc: 'Setiap hotel yang bermitra telah melewati proses seleksi demi memastikan standar pelayanan prima.' },
            { icon: Users, color: 'var(--neo-purple)', title: 'Dukungan Lokal', desc: 'Kami bangga mendukung pertumbuhan bisnis perhotelan dan pariwisata lokal di Nusantara.' }
          ].map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="card card-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: v.color, border: '3px solid var(--neo-dark)', width: 'fit-content', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0px var(--neo-dark)' }}>
                  <Icon size={20} style={{ color: 'var(--neo-dark)' }} />
                </div>
                <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.1rem', margin: 0 }}>{v.title}</h3>
                <p style={{ color: '#4b5563', fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div style={{ background: 'var(--neo-dark)', border: '4px solid var(--neo-dark)', padding: '2.5rem', color: 'white', textAlign: 'center', boxShadow: 'var(--neo-shadow-lg)' }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: '1.8rem', textTransform: 'uppercase', color: 'white', marginBottom: '0.5rem' }}>Siap Memulai Perjalanan Anda?</h2>
          <p style={{ color: '#9ca3af', fontWeight: 500, marginBottom: '1.5rem' }}>Temukan kamar terbaik dan nikmati liburan yang tak terlupakan bersama NgiNep.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/hotels" className="btn btn-yellow">Jelajahi Hotel Now</Link>
            <Link to="/register" className="btn btn-white" style={{ color: 'var(--neo-dark)' }}>Daftar Akun</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
