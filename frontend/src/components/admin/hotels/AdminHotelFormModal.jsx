import { Check, ImageIcon, Plus, X } from 'lucide-react';
import AdminModal from '../AdminModal';
import Alert from '../../ui/Alert';
import Button from '../../ui/Button';
import CitySearchSelect from '../../CitySearchSelect';
import { getImageUrl } from '../../../utils/uploads';

const HOTEL_TYPES = ['Budget', 'Bintang 2', 'Bintang 3', 'Bintang 4', 'Bintang 5', 'Resort', 'Boutique'];

const ToggleBox = ({ active, danger, label, onClick }) => (
  <div
    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--color-accent)', background: active ? (danger ? 'var(--color-danger-soft)' : 'var(--color-primary-soft)') : 'var(--color-surface)', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'all 0.3s ease' }}
    onClick={onClick}
  >
    <input type="checkbox" checked={active} readOnly style={{ width: 15, height: 15, accentColor: danger ? 'var(--color-danger)' : 'var(--color-primary)' }} />
    <label className="label" style={{ margin: 0, cursor: 'pointer', color: 'var(--color-text)' }}>{label}</label>
  </div>
);

const AdminHotelFormModal = ({
  mode,
  t,
  cities,
  form,
  setForm,
  error,
  submitting,
  imagesList,
  setImagesList,
  imageUploading,
  fileRef,
  onImageUpload,
  onSubmit,
  onClose,
}) => (
  <AdminModal title={mode === 'create' ? t('admin.hotels.createTitle') : t('admin.hotels.editTitle')} onClose={onClose} maxWidth={550}>
    {error && <Alert type="danger">{error}</Alert>}
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <label className="label">{t('admin.hotels.name')}</label>
          <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">{t('common.city')} *</label>
          <CitySearchSelect cities={cities} value={form.city_id} onChange={val => setForm(f => ({ ...f, city_id: val }))} placeholder={t('home.allCities')} />
        </div>
      </div>

      <div><label className="label">Alamat</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <label className="label">{t('admin.hotels.type')}</label>
          <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="">{t('admin.hotels.chooseType')}</option>
            {HOTEL_TYPES.map(type => <option key={type}>{type}</option>)}
          </select>
        </div>
        <div><label className="label">Rating (0-5)</label><input type="number" className="input" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} /></div>
      </div>

      <div><label className="label">{t('admin.rooms.description')}</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>

      <div>
        <label className="label"><ImageIcon size={12} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />{t('admin.hotels.gallery')}</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>
          {imagesList.map((img, idx) => (
            <div key={`${img}-${idx}`} style={{ position: 'relative', height: 75, border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <img src={getImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => setImagesList(list => list.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}>
                <X size={10} />
              </button>
            </div>
          ))}
          <div onClick={() => fileRef.current?.click()} style={{ border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-sm)', height: 75, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(212,175,55,0.02)', transition: 'all 0.2s' }}>
            <Plus size={16} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{imageUploading ? 'Uploading' : 'Upload'}</span>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: 'none' }} onChange={onImageUpload} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <ToggleBox active={form.is_featured} label="Is Featured" onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))} />
        <ToggleBox active={form.is_on_sale} danger label="On Sale" onClick={() => setForm(f => ({ ...f, is_on_sale: !f.is_on_sale }))} />
      </div>
      {form.is_on_sale && <div><label className="label">Persen Diskon (%)</label><input type="number" className="input" min={0} max={100} value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))} /></div>}

      <Button type="submit" full disabled={submitting} className="mt-2">
        {submitting ? t('admin.actions.saving') : <><Check size={14} /> {mode === 'create' ? t('admin.actions.addHotel') : t('admin.actions.saveChanges')}</>}
      </Button>
    </form>
  </AdminModal>
);

export default AdminHotelFormModal;
