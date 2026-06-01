import HomeFaqItem from './HomeFaqItem';

const HomeFaqSection = ({ t }) => (
  <div id="faq" className="reveal" style={{ maxWidth: 800, margin: '10rem auto 0', padding: '0 1.5rem' }}>
    <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', textAlign: 'center', marginBottom: '3rem', fontWeight: 300 }}>{t('home.faqTitle')}</h2>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {t('home.faqs').map(faq => <HomeFaqItem key={faq.q} q={faq.q} a={faq.a} />)}
    </div>
  </div>
);

export default HomeFaqSection;
