import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, AlertCircle, ArrowLeft, Users, ImageIcon, Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import AdminLayout from '../../components/admin/AdminLayout';
import LoadingState from '../../components/LoadingState';
import api from '../../utils/api';
import { uploadFile, validateImageFile } from '../../utils/uploads';
import { usePreferences } from '../../context/PreferencesContext';
import { cn } from '../../lib/utils';

const EMPTY_FORM = {
  name: '',
  description: '',
  price_per_night: '',
  max_guest: '2',
  room_available: '5',
  smoking: false,
  image_url: '',
  facility_ids: []
};

const AdminRoomTypes = () => {
  const { t } = usePreferences();
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resRooms, resHotel, resFacilities] = await Promise.all([
      api.get(`/api/room-types/hotel/${hotelId}`),
      api.get(`/api/hotels/${hotelId}`),
      api.get('/api/facilities')]
      );
      setRooms(resRooms.data.data || []);
      setHotel(resHotel.data.data);
      setFacilities(resFacilities.data.data || []);
    } catch {
      setError(t('admin.errors.loadRooms'));
    } finally {
      setLoading(false);
    }
  }, [hotelId, t]);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const openEdit = (room) => {
    setSelected(room);
    const existingImg = room.images?.[0]?.imageUrl || '';
    const roomFacilityIds = (room.facilities || []).
    map((facility) => facility.id_facility ?? facility.idFacility ?? facility.id).
    filter((id) => id != null).
    map(Number);
    setForm({
      name: room.name,
      description: room.description || '',
      price_per_night: room.price_per_night.toString(),
      max_guest: room.max_guest.toString(),
      room_available: room.room_available.toString(),
      smoking: room.is_smoking || room.smoking || false,
      image_url: existingImg,
      facility_ids: roomFacilityIds
    });
    setImgPreview(existingImg);
    setError('');
    setModal('edit');
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setImgPreview('');
    setError('');
    setModal('create');
  };

  const openDelete = (room) => {
    setSelected(room);
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        hotel_id: parseInt(hotelId),
        description: form.description,
        price_per_night: parseInt(form.price_per_night),
        max_guest: parseInt(form.max_guest),
        room_available: parseInt(form.room_available),
        smoking: form.smoking,
        image_url: form.image_url,
        facility_ids: form.facility_ids.map(Number)
      };

      if (modal === 'create') {
        await api.post('/api/room-types', payload);
      } else if (modal === 'edit') {
        await api.put(`/api/room-types/${selected.id_room_type}`, payload);
      }
      closeModal();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.saveRoomFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/api/room-types/${selected.id_room_type}`);
      closeModal();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || t('admin.errors.deleteRoomFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFacility = (facilityId) => {
    setForm((current) => ({
      ...current,
      facility_ids: current.facility_ids.includes(facilityId) ?
      current.facility_ids.filter((id) => id !== facilityId) :
      [...current.facility_ids, facilityId]
    }));
  };

  return (
    <AdminLayout>
      {/* Back Button & Header */}
      <div className="[margin-bottom:2rem]">
        <Link to="/admin/hotels" className="[display:inline-flex] [align-items:center] [gap:0.5rem] [font-family:var(--font-body)] [font-weight:400] [text-decoration:none] [color:var(--color-text)] [margin-bottom:1.25rem] [text-transform:uppercase] [font-size:0.75rem] [letter-spacing:1px]">
          <ArrowLeft size={14} /> {t('admin.actions.backToHotels')}
        </Link>
        <div className="[display:flex] [justify-content:space-between] [align-items:center] [flex-wrap:wrap] [gap:1rem]">
          <div>
            <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.75rem] [text-transform:uppercase] [letter-spacing:1px] [margin:0] [color:var(--color-text)]">
              {t('admin.rooms.title')}
            </h2>
            <p className="[color:var(--color-muted)] [font-weight:300] [font-size:0.85rem] [margin:0.25rem_0_0]">
              {t('admin.rooms.subtitle', { hotel: hotel?.name || t('admin.rooms.loadingHotel'), count: rooms.length })}
            </p>
          </div>
          <button onClick={openCreate} className="btn btn-primary btn-sm">
            <Plus size={14} /> {t('admin.actions.addRoomType')}
          </button>
        </div>
      </div>

      {error &&
      <div className="alert-danger [border-radius:var(--radius-sm)] [padding:0.75rem_1rem] [margin-bottom:1.25rem] [display:flex] [gap:0.5rem] [align-items:center]">
          <AlertCircle size={16} className="[color:var(--color-danger)] [flex-shrink:0]" />
          <span className="[font-weight:300] [color:var(--color-danger)] [font-size:0.85rem]">{error}</span>
        </div>
      }

      {loading ?
      <LoadingState text={t('admin.rooms.loading')} compact /> :

      <div className="[overflow-x:auto]">
          <table className="neo-table">
            <thead>
              <tr>
                {[t('admin.table.number'), t('admin.table.image'), t('admin.table.roomType'), t('admin.table.pricePerNight'), t('admin.table.capacity'), t('admin.table.roomsAvailable'), t('admin.table.smoking'), t('admin.table.actions')].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => {
              const thumb = r.images?.[0]?.imageUrl || '';
              return (
                <tr key={r.id_room_type}>
                    <td className="[font-weight:400] [color:var(--color-muted)] [font-size:0.85rem]">#{r.id_room_type}</td>
                    <td>
                      {thumb ?
                    <img src={thumb} alt={r.name} className="[width:60px] [height:45px] [object-fit:cover] [border-radius:var(--radius-sm)] [border:1px_solid_var(--color-accent)]" /> :

                    <div className="[width:60px] [height:45px] [background:var(--color-background)] [border-radius:var(--radius-sm)] [border:1px_solid_var(--color-accent)] [display:flex] [align-items:center] [justify-content:center]">
                          <ImageIcon size={14} className="[color:var(--color-muted)]" />
                        </div>
                    }
                    </td>
                    <td>
                      <div className="[font-weight:400] [font-size:0.9rem] [color:var(--color-text)]">
                        {r.name}
                      </div>
                      <div className="[color:var(--color-muted)] [font-size:0.75rem] [font-weight:300] [margin-top:0.15rem]">
                        {r.description || t('admin.rooms.noDescription')}
                      </div>
                      {(r.facilities || []).length > 0 &&
                    <div className="[display:flex] [flex-wrap:wrap] [gap:0.3rem] [margin-top:0.55rem]">
                          {r.facilities.slice(0, 3).map((facility) =>
                      <span key={facility.id_facility ?? facility.idFacility ?? facility.name} className="badge badge-gray [font-size:0.62rem]">
                              {facility.name}
                            </span>
                      )}
                          {r.facilities.length > 3 &&
                      <span className="badge badge-gray [font-size:0.62rem]">+{r.facilities.length - 3}</span>
                      }
                        </div>
                    }
                    </td>
                    <td className="[font-weight:400] [color:var(--color-primary)] [font-size:0.875rem]">
                      {formatCurrency(r.price_per_night)}
                    </td>
                    <td className="[font-size:0.85rem] [color:var(--color-text)] [font-weight:300]">
                      <div className="[display:flex] [align-items:center] [gap:0.25rem]">
                        <Users size={12} className="[color:var(--color-muted)]" /> {t('admin.rooms.guests', { count: r.max_guest })}
                      </div>
                    </td>
                    <td className="[font-size:0.85rem] [color:var(--color-text)] [font-weight:300]">
                      {t('admin.rooms.rooms', { count: r.room_available })}
                    </td>
                    <td>
                      {r.is_smoking || r.smoking ?
                    <span className="badge badge-gray [font-size:0.7rem]">{t('admin.rooms.smokeAllowed')}</span> :

                    <span className="badge badge-green [font-size:0.7rem]">{t('admin.rooms.smokeFree')}</span>
                    }
                    </td>
                    <td>
                      <div className="[display:flex] [gap:0.5rem]">
                        <button onClick={() => openEdit(r)} className="btn btn-white btn-sm [padding:0.4rem_0.8rem]" title={t('admin.rooms.editTitle')}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => openDelete(r)} className="btn btn-white btn-sm [padding:0.4rem_0.8rem] [color:var(--color-danger)]" title={t('admin.rooms.deleteRoomType')}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
          {rooms.length === 0 &&
        <div className="card [text-align:center] [padding:3rem] [color:var(--color-muted)] [font-weight:300] [font-size:0.9rem]">
              {t('admin.rooms.empty')}
            </div>
        }
        </div>
      }

      {/* Create/Edit Modal */}
      {(modal === 'create' || modal === 'edit') &&
      <ModalOverlay onClose={closeModal}>
          <div className="[font-family:var(--font-heading)] [font-weight:300] [text-transform:uppercase] [letter-spacing:1px] [font-size:1.2rem] [margin-bottom:1.5rem] [border-bottom:1px_solid_var(--color-accent)] [padding-bottom:0.75rem] [display:flex] [justify-content:space-between] [align-items:center] [color:var(--color-text)]">
            {modal === 'create' ? t('admin.rooms.createTitle') : t('admin.rooms.editTitle')}
            <button onClick={closeModal} className="[background:none] [border:none] [cursor:pointer] [color:var(--color-muted)]"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="[display:flex] [flex-direction:column] [gap:1.25rem]">
            <div>
              <label className="label">{t('admin.rooms.name')}</label>
              <input className="input" placeholder="Standard Room, Suite Room..." value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">{t('admin.rooms.description')}</label>
              <textarea className="input [min-height:80px] [resize:vertical]" placeholder={t('admin.rooms.description')} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1.25rem]">
              <div>
                <label className="label">{t('admin.rooms.price')}</label>
                <input type="number" className="input" value={form.price_per_night} onChange={(e) => setForm((f) => ({ ...f, price_per_night: e.target.value }))} required />
              </div>
              <div>
                <label className="label">{t('admin.rooms.capacity')}</label>
                <input type="number" className="input" min="1" value={form.max_guest} onChange={(e) => setForm((f) => ({ ...f, max_guest: e.target.value }))} required />
              </div>
            </div>
            <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:1.25rem]">
              <div>
                <label className="label">{t('admin.rooms.availableRooms')}</label>
                <input type="number" className="input" min="0" value={form.room_available} onChange={(e) => setForm((f) => ({ ...f, room_available: e.target.value }))} required />
              </div>
              <div className="[display:flex] [align-items:center] [height:100%] [padding-top:1.5rem]">
                <div className={cn('flex w-full cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-accent)] p-3 transition', form.smoking ? 'bg-[var(--color-primary-soft)]' : 'bg-[var(--color-surface)]')} onClick={() => setForm((f) => ({ ...f, smoking: !f.smoking }))}>
                  <input type="checkbox" checked={form.smoking} readOnly className="[width:15px] [height:15px] [accent-color:var(--color-primary)]" />
                  <label className="label [margin:0] [cursor:pointer] [color:var(--color-text)]">{t('admin.rooms.smokingRoom')}</label>
                </div>
              </div>
            </div>

            <div>
              <label className="label"><Sparkles size={12} className="[display:inline] [margin-right:0.4rem] [vertical-align:middle]" />{t('admin.rooms.facilities')}</label>
              <p className="[color:var(--color-muted)] [font-size:0.78rem] [line-height:1.5] [margin:0_0_0.75rem]">
                {t('admin.rooms.facilitiesHint')}
              </p>
              {facilities.length > 0 ?
            <div className="[display:grid] [grid-template-columns:repeat(auto-fit,_minmax(145px,_1fr))] [gap:0.65rem]">
                  {facilities.map((facility) => {
                const facilityId = Number(facility.id_facility ?? facility.idFacility ?? facility.id);
                const selectedFacility = form.facility_ids.includes(facilityId);
                return (
                  <button
                    key={facilityId}
                    type="button"
                    onClick={() => toggleFacility(facilityId)}
                    aria-pressed={selectedFacility}
                    className={cn(
                      'flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[0.82rem] text-[var(--color-text)]',
                      selectedFacility
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                        : 'border-[var(--color-accent)] bg-[var(--color-surface)]',
                    )}>

                        <span className={cn(
                          'grid size-[18px] shrink-0 place-items-center rounded text-white',
                          selectedFacility
                            ? 'border border-[var(--color-primary)] bg-[var(--color-primary)]'
                            : 'border border-[var(--color-muted)] bg-transparent',
                        )}>
                          {selectedFacility && <Check size={12} />}
                        </span>
                        <span>{facility.name}</span>
                      </button>);

              })}
                </div> :

            <div className="[color:var(--color-muted)] [font-size:0.82rem] [padding:0.75rem] [border:1px_dashed_var(--color-accent)]">
                  {t('admin.rooms.noFacilities')}
                </div>
            }
            </div>

            {/* Gambar Kamar */}
            <div>
              <label className="label"><ImageIcon size={12} className="[display:inline] [margin-right:0.4rem] [vertical-align:middle]" />{t('admin.rooms.roomPhoto')}</label>
              <div
              onClick={() => fileRef.current?.click()}
              className={cn('cursor-pointer rounded-lg border border-dashed border-[var(--color-primary)] px-4 py-6 text-center transition', imgPreview ? 'bg-amber-400/[0.01]' : 'bg-transparent')}>

                {imgPreview ?
              <div>
                    <img src={imgPreview} alt="preview" className="[max-height:120px] [max-width:100%] [object-fit:cover] [border-radius:var(--radius-sm)] [border:1px_solid_var(--color-accent)] [margin-bottom:0.5rem]" />
                    <div className="[font-size:0.75rem] [font-weight:400] [color:var(--color-primary)]">{t('admin.rooms.changePhoto')}</div>
                  </div> :

              <div>
                    <ImageIcon size={28} className="[color:var(--color-muted)] [margin-bottom:0.4rem]" />
                    <div className="[font-weight:300] [font-size:0.8rem] [color:var(--color-text)]">{uploadingImage ? t('admin.rooms.uploadingPhoto') : t('admin.rooms.uploadPhoto')}</div>
                    <div className="[font-size:0.7rem] [color:var(--color-muted)] [margin-top:0.2rem]">JPG, PNG, WEBP · Maks 5MB</div>
                  </div>
              }
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const validationError = validateImageFile(file);
              if (validationError) {setError(validationError);return;}
              setError('');
              setUploadingImage(true);
              try {
                const imageUrl = await uploadFile('/api/room-types/upload-image', file, 'file', { hotel_id: hotelId });
                setImgPreview(imageUrl);
                setForm((f) => ({ ...f, image_url: imageUrl }));
              } catch (err) {
                setError(err.response?.data?.message || t('admin.errors.uploadRoomPhotoFailed'));
              } finally {
                setUploadingImage(false);
                if (fileRef.current) fileRef.current.value = '';
              }
            }} className="[display:none]" />
            </div>
            <div className="[display:flex] [gap:0.75rem] [margin-top:0.5rem]">
              <button type="submit" className="btn btn-primary btn-sm [flex:1] [justify-content:center]" disabled={submitting}>
                {submitting ? t('admin.actions.saving') : <><Check size={14} /> {t('admin.rooms.saveRoomType')}</>}
              </button>
              <button type="button" onClick={closeModal} className="btn btn-white btn-sm" disabled={submitting}>
                {t('admin.actions.cancel')}
              </button>
            </div>
          </form>
        </ModalOverlay>
      }

      {/* Delete Modal */}
      {modal === 'delete' &&
      <ModalOverlay onClose={closeModal} maxWidth={400}>
          <div className="[text-align:center] [padding:1rem_0]">
            <div className="[font-size:2.5rem] [margin-bottom:1rem]">🗑️</div>
            <h3 className="[font-family:var(--font-heading)] [font-weight:300] [text-transform:uppercase] [letter-spacing:1px] [font-size:1.25rem] [margin-bottom:0.75rem] [color:var(--color-text)]">{t('admin.rooms.deleteTitle')}</h3>
            <p className="[color:var(--color-muted)] [font-weight:300] [font-size:0.9rem] [line-height:1.5] [margin-bottom:1.75rem]">{t('admin.rooms.deleteMessage', { name: selected?.name })}</p>
            <div className="[display:flex] [gap:0.75rem] [justify-content:center]">
              <button onClick={closeModal} className="btn btn-white btn-sm">{t('admin.actions.cancel')}</button>
              <button onClick={handleDelete} className="btn btn-primary btn-sm [background:var(--color-danger)] [color:#FFFFFF]" disabled={submitting}>{submitting ? t('admin.actions.deleting') : t('admin.actions.delete')}</button>
            </div>
          </div>
        </ModalOverlay>
      }
    </AdminLayout>);

};

const ModalOverlay = ({ children, onClose, maxWidth = 500 }) => {
  return (
    <div onClick={onClose} className="[position:fixed] [inset:0] [background:rgba(26,54,93,0.3)] [backdrop-filter:blur(4px)] [display:flex] [align-items:center] [justify-content:center] [z-index:100] [padding:1rem]">
      <div className={cn(
        'relative max-h-[90vh] w-full overflow-y-auto rounded-lg border border-[var(--color-accent)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-hover)] [animation:fadeIn_0.2s_ease-out]',
        maxWidth <= 400 ? 'max-w-[400px]' : 'max-w-[500px]',
      )} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>);

};

export default AdminRoomTypes;
