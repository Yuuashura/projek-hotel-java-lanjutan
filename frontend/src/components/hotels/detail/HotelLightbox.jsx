import { ArrowLeft, X } from 'lucide-react';

const HotelLightbox = ({ images, activeImg, setActiveImg, onClose, hotelName }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(26,54,93,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
    <button onClick={onClose} style={{ position: 'absolute', top: 30, right: 30, background: 'transparent', border: 'none', cursor: 'pointer', color: 'white' }}>
      <X size={32} />
    </button>

    <button onClick={() => setActiveImg(current => (current - 1 + images.length) % images.length)} style={{ position: 'absolute', left: 40, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', padding: '0.75rem', cursor: 'pointer', color: 'white' }}>
      <ArrowLeft size={24} />
    </button>

    <div style={{ maxWidth: '80%', maxHeight: '80%', overflow: 'hidden' }}>
      <img src={images[activeImg]} alt={`${hotelName} - foto ${activeImg + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>

    <button onClick={() => setActiveImg(current => (current + 1) % images.length)} style={{ position: 'absolute', right: 40, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', padding: '0.75rem', cursor: 'pointer', color: 'white' }}>
      <ArrowLeft size={24} style={{ transform: 'rotate(180deg)' }} />
    </button>
  </div>
);

export default HotelLightbox;
