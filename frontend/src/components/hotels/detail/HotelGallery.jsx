const HotelGallery = ({ images, hotelName, t, onOpen }) => (
  <section className={`hotel-gallery ${images.length === 1 ? 'single' : ''}`} aria-label={t('hotelDetail.gallery')}>
    <button type="button" className="hotel-gallery-main" onClick={() => onOpen(0)}>
      <img src={images[0]} alt={`${hotelName} - foto utama`} />
      <span className="hotel-gallery-shade" />
      <span className="hotel-gallery-caption">
        <span>{t('hotelDetail.gallery')}</span>
        <strong>{hotelName}</strong>
      </span>
    </button>

    {images.length > 1 && (
      <div className="hotel-gallery-thumbs">
        {[1, 2, 3, 4].map((slot) => {
          const imageIndex = Math.min(slot, images.length - 1);
          const showMore = slot === 4 && images.length > 5;
          return (
            <button
              type="button"
              key={slot}
              className="hotel-gallery-thumb"
              onClick={() => onOpen(imageIndex)}
            >
              <img src={images[imageIndex]} alt={`${hotelName} - foto ${imageIndex + 1}`} />
              {showMore && <span className="hotel-gallery-more">{t('hotelDetail.morePhotos', { count: images.length - 4 })}</span>}
            </button>
          );
        })}
      </div>
    )}
  </section>
);

export default HotelGallery;
