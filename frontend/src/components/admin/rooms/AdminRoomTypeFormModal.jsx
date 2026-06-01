import { Check, ImageIcon } from 'lucide-react';
import AdminModal from '../AdminModal';
import Button from '../../ui/Button';

const inputGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' };

const AdminRoomTypeFormModal = ({
  mode,
  t,
  form,
  setForm,
  imgPreview,
  uploadingImage,
  submitting,
  fileRef,
  onImageChange,
  onSubmit,
  onClose,
}) => (
  <AdminModal title={mode === 'create' ? t('admin.rooms.createTitle') : t('admin.rooms.editTitle')} onClose={onClose} maxWidth={500}>
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label className="label">{t('admin.rooms.name')}</label>
        <input className="input" placeholder="Standard Room, Suite Room..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
      </div>
      <div>
        <label className="label">{t('admin.rooms.description')}</label>
        <textarea className="input" style={{ minHeight: 80, resize: 'vertical' }} placeholder={t('admin.rooms.description')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div style={inputGridStyle}>
        <div>
          <label className="label">{t('admin.rooms.price')}</label>
          <input type="number" className="input" value={form.price_per_night} onChange={e => setForm(f => ({ ...f, price_per_night: e.target.value }))} required />
        </div>
        <div>
          <label className="label">{t('admin.rooms.capacity')}</label>
          <input type="number" className="input" min="1" value={form.max_guest} onChange={e => setForm(f => ({ ...f, max_guest: e.target.value }))} required />
        </div>
      </div>
      <div style={inputGridStyle}>
        <div>
          <label className="label">{t('admin.rooms.availableRooms')}</label>
          <input type="number" className="input" min="0" value={form.room_available} onChange={e => setForm(f => ({ ...f, room_available: e.target.value }))} required />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--color-accent)', background: form.smoking ? 'var(--color-primary-soft)' : 'var(--color-surface)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease', width: '100%' }} onClick={() => setForm(f => ({ ...f, smoking: !f.smoking }))}>
            <input type="checkbox" checked={form.smoking} readOnly style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }} />
            <label className="label" style={{ margin: 0, cursor: 'pointer', color: 'var(--color-text)' }}>{t('admin.rooms.smokingRoom')}</label>
          </div>
        </div>
      </div>

      <div>
        <label className="label"><ImageIcon size={12} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />{t('admin.rooms.roomPhoto')}</label>
        <div onClick={() => fileRef.current?.click()} style={{ border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-sm)', padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', background: imgPreview ? 'rgba(212,175,55,0.01)' : 'transparent', transition: 'all 0.2s' }}>
          {imgPreview ? (
            <div>
              <img src={imgPreview} alt="preview" style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-accent)', marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--color-primary)' }}>{t('admin.rooms.changePhoto')}</div>
            </div>
          ) : (
            <div>
              <ImageIcon size={28} style={{ color: 'var(--color-muted)', marginBottom: '0.4rem' }} />
              <div style={{ fontWeight: 300, fontSize: '0.8rem', color: 'var(--color-text)' }}>{uploadingImage ? t('admin.rooms.uploadingPhoto') : t('admin.rooms.uploadPhoto')}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '0.2rem' }}>JPG, PNG, WEBP - Maks 5MB</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={onImageChange} />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <Button type="submit" size="sm" full disabled={submitting}>
          {submitting ? t('admin.actions.saving') : <><Check size={14} /> {t('admin.rooms.saveRoomType')}</>}
        </Button>
        <Button type="button" onClick={onClose} variant="white" size="sm" disabled={submitting}>
          {t('admin.actions.cancel')}
        </Button>
      </div>
    </form>
  </AdminModal>
);

export default AdminRoomTypeFormModal;
