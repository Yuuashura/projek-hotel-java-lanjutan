import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { usePreferences } from '../../context/PreferencesContext';
import HomeBenefitsSection from '../../components/home/HomeBenefitsSection';
import HomeFaqSection from '../../components/home/HomeFaqSection';
import HomeHeroSlider from '../../components/home/HomeHeroSlider';
import HomeHotelSection from '../../components/home/HomeHotelSection';
import HomeSearchBar from '../../components/home/HomeSearchBar';
import { homeSlides } from '../../components/home/homeSlides';

const FEATURED_LIMIT = 12;
const SALE_LIMIT = 3;

const Home = () => {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [cities, setCities] = useState([]);
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [saleHotels, setSaleHotels] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [search, setSearch] = useState({ city: '', keyword: '' });
  const timerRef = useRef(null);

  useEffect(() => {
    if (!hovering) {
      timerRef.current = setInterval(() => setCurrent(c => (c + 1) % homeSlides.length), 5000);
    }
    return () => clearInterval(timerRef.current);
  }, [hovering]);

  useEffect(() => {
    const controller = new AbortController();

    api.get('/api/cities', { signal: controller.signal }).then(r => setCities(r.data.data || [])).catch(() => {});
    setFeaturedLoading(true);
    api.get('/api/hotels', {
      params: { page: 0, size: FEATURED_LIMIT, sortBy: 'rating' },
      signal: controller.signal,
    })
      .then(r => setFeaturedHotels(r.data.data || []))
      .catch(() => setFeaturedHotels([]))
      .finally(() => setFeaturedLoading(false));
    api.get('/api/hotels', { params: { onSale: true, page: 0, size: SALE_LIMIT, sortBy: 'rating' }, signal: controller.signal })
      .then(r => setSaleHotels(r.data.data || []))
      .catch(() => {});

    return () => controller.abort();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.keyword) params.set('keyword', search.keyword);
    if (search.city) params.set('cityId', search.city);
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background-luxury)', backgroundAttachment: 'fixed' }}>
      <HomeHeroSlider current={current} setCurrent={setCurrent} setHovering={setHovering} t={t} />
      <HomeSearchBar t={t} cities={cities} search={search} setSearch={setSearch} onSubmit={handleSearch} />
      <HomeHotelSection t={t} eyebrow={t('home.editorPick')} title={t('home.featuredTitle')} hotels={featuredHotels} loading={featuredLoading} viewAllTo="/hotels" />
      {saleHotels.length > 0 && (
        <HomeHotelSection t={t} eyebrow={t('home.saleEyebrow')} title={t('home.saleTitle')} hotels={saleHotels} loading={false} sale viewAllTo="/hotels?sale=true" />
      )}
      <HomeBenefitsSection t={t} />
      <HomeFaqSection t={t} />
      <div style={{ height: '8rem' }} />
    </div>
  );
};

export default Home;
