import { ImageIcon } from 'lucide-react';

const PaymentProofUpload = ({ fileRef, previewFile, previewUrl, onChange }) => (
  <div>
    <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Bukti Pembayaran *</label>
    <div
      onClick={() => fileRef.current?.click()}
      style={{
        border: previewUrl ? '1px solid #38A169' : '1px dashed var(--color-muted)',
        padding: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        background: previewUrl ? 'rgba(72,187,120,0.02)' : 'transparent',
        transition: 'all 0.3s ease',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '0.5rem',
      }}
    >
      {previewUrl ? (
        <div>
          <img src={previewUrl} alt="Bukti bayar" style={{ maxHeight: 180, maxWidth: '100%', objectFit: 'contain', borderRadius: 2, marginBottom: '1rem', border: '1px solid var(--color-accent)' }} />
          <div style={{ fontSize: '0.8rem', fontWeight: 400, color: '#38A169' }}>
            {previewFile ? previewFile.name : 'Bukti transfer siap kirim'}
          </div>
        </div>
      ) : (
        <div>
          <ImageIcon size={32} style={{ color: 'var(--color-muted)', marginBottom: '0.5rem' }} />
          <div style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--color-text)' }}>Klik untuk memilih file bukti bayar</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 300, marginTop: '0.25rem' }}>Format gambar JPG, PNG, WEBP max 5MB</div>
        </div>
      )}
    </div>
    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
  </div>
);

export default PaymentProofUpload;
