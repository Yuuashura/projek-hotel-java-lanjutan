import React, { useState } from 'react';
import { Search, Compass, Calendar, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');

  const featuredHotels = [
    {
      id: 1,
      name: "Neo Brutalism Palace",
      city: "Bandung",
      rating: 4.8,
      price: 650000,
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
      tag: "FEATURED"
    },
    {
      id: 2,
      name: "Retro Modern Resort",
      city: "Bali",
      rating: 4.9,
      price: 1200000,
      image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=600",
      tag: "PROMO 20%"
    },
    {
      id: 3,
      name: "The Angular Inn",
      city: "Jakarta",
      rating: 4.5,
      price: 450000,
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=600",
      tag: "POPULAR"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
      
      {/* Hero Section */}
      <section className="relative bg-neo-yellow border-4 border-black p-8 md:p-16 mb-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-3xl flex flex-col gap-6">
          <span className="neo-badge bg-black text-white self-start">
            🚀 Microservices Web App
          </span>
          <h1 className="font-display font-black text-4xl md:text-6xl text-neo-dark uppercase tracking-tight leading-none">
            NgiNep di Hotel Impian, <br className="hidden md:inline" />
            <span className="bg-white border-3 border-black px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block mt-2 text-neo-orange">
              Bayar Instan!
            </span>
          </h1>
          <p className="font-sans font-bold text-lg md:text-xl text-neo-dark/80 max-w-xl leading-relaxed">
            Platform modern pemesanan kamar hotel lintas kota. Dilengkapi dengan validasi data real-time, DTO terproteksi, dan sistem pembayaran OTP tervalidasi.
          </p>
          
          {/* Action Button */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Link to="/hotels" className="neo-btn bg-black text-white hover:bg-neo-dark shadow-[4px_4px_0px_0px_#FFE600] border-white">
              Cari Kamar Sekarang <ArrowRight className="ml-2" size={18} />
            </Link>
            <a href="#features" className="neo-btn-secondary">
              Pelajari Fitur
            </a>
          </div>
        </div>

        {/* Decorative Grid Element */}
        <div className="absolute right-8 bottom-8 hidden lg:flex w-48 h-48 border-4 border-dashed border-black/20 items-center justify-center font-display font-black text-8xl text-black/10 select-none">
          99
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="bg-white border-4 border-black p-6 mb-16 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -mt-24 relative z-10 mx-4 md:mx-12">
        <h2 className="font-display font-black text-xl uppercase mb-4 flex items-center gap-2">
          <Search size={22} className="text-neo-orange" /> Temukan Penginapan Terbaik
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-black uppercase mb-1.5 text-gray-500">Nama Hotel / Kata Kunci</label>
            <input 
              type="text" 
              placeholder="Cari hotel, bintang, dll..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="neo-input"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase mb-1.5 text-gray-500">Pilih Kota Utama</label>
            <select 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="neo-input"
            >
              <option value="">Semua Kota</option>
              <option value="1">Bandung</option>
              <option value="2">Jakarta</option>
              <option value="3">Bali</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="neo-btn-orange w-full py-3.5">
              Cari Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Keunggulan Section */}
      <section id="features" className="mb-16">
        <h2 className="font-display font-black text-3xl uppercase text-center mb-12">
          Kenapa Harus <span className="bg-neo-blue border-3 border-black px-2 py-0.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] inline-block rotate-[-1deg]">NgiNep.</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="neo-card flex flex-col gap-4">
            <div className="w-12 h-12 bg-neo-purple border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-white">
              <Compass size={24} />
            </div>
            <h3 className="font-display font-black text-xl uppercase">Kemudahan Browse</h3>
            <p className="font-bold text-gray-500 text-sm leading-relaxed">
              Jelajahi ratusan hotel lintas kota dengan filter kota terpadu, harga termurah, fasilitas, serta rating pengunjung yang transparan.
            </p>
          </div>

          <div className="neo-card flex flex-col gap-4">
            <div className="w-12 h-12 bg-neo-green border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-neo-dark">
              <Calendar size={24} />
            </div>
            <h3 className="font-display font-black text-xl uppercase">Verifikasi Instan</h3>
            <p className="font-bold text-gray-500 text-sm leading-relaxed">
              Sistem backend microservice kami langsung melakukan validasi ketersediaan kamar, kalkulasi harga, dan deadline tenggat bayar otomatis.
            </p>
          </div>

          <div className="neo-card flex flex-col gap-4">
            <div className="w-12 h-12 bg-neo-pink border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-white">
              <Shield size={24} />
            </div>
            <h3 className="font-display font-black text-xl uppercase">Aman & Terpercaya</h3>
            <p className="font-bold text-gray-500 text-sm leading-relaxed">
              Keamanan JWT terenkripsi, perlindungan DTO database yang solid, serta exception handler seragam menjamin transaksi Anda 100% aman.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="font-display font-black text-neo-orange uppercase tracking-wide text-sm">Rekomendasi Kami</span>
            <h2 className="font-display font-black text-3xl uppercase mt-1">Hotel Pilihan Terbaik</h2>
          </div>
          <Link to="/hotels" className="font-display font-black text-sm uppercase flex items-center gap-1 hover:text-neo-orange transition-colors">
            Lihat Semua <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredHotels.map(hotel => (
            <div key={hotel.id} className="neo-card p-0 overflow-hidden flex flex-col group">
              {/* Gambar */}
              <div className="h-48 border-b-3 border-black overflow-hidden relative">
                <img 
                  src={hotel.image} 
                  alt={hotel.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 neo-badge bg-neo-yellow font-black text-xs">
                  {hotel.tag}
                </span>
              </div>
              
              {/* Konten */}
              <div className="p-5 flex flex-col gap-3 flex-grow">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                  <span className="bg-neo-light border border-black px-2 py-0.5 text-neo-dark uppercase font-display">{hotel.city}</span>
                  <span className="flex items-center gap-1 text-neo-orange">★ {hotel.rating}</span>
                </div>
                
                <h3 className="font-display font-black text-lg uppercase leading-tight line-clamp-1 group-hover:text-neo-orange transition-colors">
                  {hotel.name}
                </h3>
                
                <p className="text-xs text-gray-500 font-bold leading-relaxed line-clamp-2">
                  Pengalaman menginap tak terlupakan dengan layanan bintang lima dan arsitektur neo-brutalis modern yang estetis.
                </p>

                <div className="border-t-2 border-dashed border-gray-200 pt-3 mt-2 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-400 block font-bold">Mulai dari</span>
                    <span className="font-display font-black text-neo-dark text-lg">Rp {hotel.price.toLocaleString('id-ID')}<span className="text-xs text-gray-400 font-sans font-bold">/malam</span></span>
                  </div>
                  <Link to={`/hotels/${hotel.id}`} className="neo-btn px-4 py-2 text-xs">
                    Detail
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
