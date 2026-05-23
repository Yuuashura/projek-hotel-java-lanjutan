import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Award, Users } from 'lucide-react';

const About = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', padding: '6rem 1.5rem' }}>
      <div style={{ maxWidth: 850, margin: '0 auto' }}>
        
        {/* Title Section */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Tentang Kami</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginTop: '0.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Kenalan Lebih Dekat dengan <span style={{ color: 'var(--color-primary)', fontStyle: 'italic' }}>NgiNep.</span>
          </h1>
          <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '1.1rem', maxWidth: 650, margin: '0 auto', lineHeight: 1.8 }}>
            Kami hadir sebagai kurator akomodasi mewah pertama di Indonesia yang mengutamakan kedamaian estetika, eksklusivitas, dan pengalaman pemesanan yang bebas hambatan.
          </p>
        </div>

        {/* Story Section */}
        <div className="card reveal" style={{ padding: '3rem', marginBottom: '4rem', border: '1px solid var(--color-accent)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>Misi & Visi Kami</h2>
          <p style={{ color: 'var(--color-text)', fontWeight: 300, lineHeight: 1.9, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            NgiNep lahir dari visi sederhana: menyaring kebisingan dari proses pencarian hotel konvensional dan menghadirkan antarmuka tenang yang estetik. Kami percaya bahwa perencanaan liburan seharusnya terasa menenangkan sejak interaksi pertama Anda di platform kami.
          </p>
          <p style={{ color: 'var(--color-text)', fontWeight: 300, lineHeight: 1.9, fontSize: '0.95rem' }}>
            Melalui kurasi ketat terhadap hotel butik dan resort bintang lima lokal, kami memastikan setiap properti yang bermitra dengan kami tidak hanya menawarkan tempat tidur, melainkan sebuah ruang inspirasi dan ketenteraman jiwa.
          </p>
        </div>

        {/* Value Grid */}
        <div className="reveal" style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2rem', textAlign: 'center', marginBottom: '3rem', color: 'var(--color-text)' }}>Nilai Utama Kami</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {[
              { icon: ShieldCheck, color: 'rgba(72, 187, 120, 0.1)', iconColor: '#38A169', title: 'Kepercayaan Penuh', desc: 'Sistem keamanan data terenkripsi dan transparansi biaya memastikan transaksi Anda sepenuhnya aman tanpa kejutan biaya tambahan.' },
              { icon: Heart, color: 'rgba(229, 62, 62, 0.1)', iconColor: '#E53E3E', title: 'Fokus Pelanggan', desc: 'Kami mengutamakan kedamaian batin Anda melalui antarmuka pemesanan yang mulus dan cepat.' },
              { icon: Award, color: 'rgba(212, 175, 55, 0.1)', iconColor: 'var(--color-primary)', title: 'Kualitas Terkurasi', desc: 'Hanya properti berstandar tinggi dengan komitmen penuh pada keindahan desain dan kebersihan yang dapat bergabung.' },
              { icon: Users, color: 'rgba(43, 108, 176, 0.1)', iconColor: '#2B6CB0', title: 'Dukungan Lokal', desc: 'Berkolaborasi erat dengan pengelola resort lokal demi memajukan perekonomian dan destinasi wisata tanah air.' }
            ].map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="card card-hover" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--color-accent)' }}>
                  <div style={{ background: v.color, width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} style={{ color: v.iconColor }} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '1.3rem', margin: 0, color: 'var(--color-text)' }}>{v.title}</h3>
                  <p style={{ color: 'var(--color-muted)', fontWeight: 300, fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="reveal" style={{ background: 'var(--color-text)', borderRadius: 'var(--radius-sm)', padding: '3.5rem 2rem', color: 'white', textAlign: 'center', boxShadow: 'var(--shadow-hover)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 300, fontSize: '2.2rem', color: 'white', marginBottom: '1rem' }}>Siap Memulai Liburan Impian Anda?</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 300, marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem', fontSize: '0.95rem' }}>Temukan kamar terbaik dengan ketenangan mutlak dan buat momen tak terlupakan bersama NgiNep.</p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/hotels" className="btn btn-primary" style={{ background: 'var(--color-primary)' }}>Jelajahi Hotel</Link>
            <Link to="/register" className="btn btn-white" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Daftar Akun</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
