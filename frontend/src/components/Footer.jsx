import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Heart, Globe, MessageCircle, Share2 } from 'lucide-react';
import { usePreferences } from '../context/PreferencesContext';

const Footer = () => {
  const { t } = usePreferences();

  const services = [
  { text: t('nav.home'), to: '/' },
  { text: t('footer.searchHotels'), to: '/hotels' },
  { text: t('footer.deals'), to: '/hotels?sale=true' },
  { text: t('nav.myBookings'), to: '/my-bookings' },
  { text: t('nav.profile'), to: '/profile' }];


  const company = [
  { text: t('nav.about'), to: '/about' },
  { text: t('footer.terms'), to: '#' },
  { text: t('footer.privacy'), to: '#' },
  { text: t('footer.careers'), to: '#' },
  { text: 'Blog', to: '#' }];


  return (
    <footer className="[background:linear-gradient(135deg,_#081827,_#102A43)] [color:#F9FAFB] [border-top:1px_solid_rgba(255,255,255,0.08)] [margin-top:6rem] [font-family:var(--font-body)] [font-weight:300]">
      <div className="[max-width:1280px] [margin:0_auto] [padding:4rem_1.5rem] [display:grid] [grid-template-columns:repeat(auto-fit,_minmax(220px,_1fr))] [gap:3rem]">
        <div>
          <div className="[font-family:var(--font-heading)] [font-size:1.8rem] [color:#FFFFFF] [letter-spacing:1px] [margin-bottom:1.25rem]">
            NgiNep<span className="[color:var(--color-gold)]">.</span>
          </div>
          <p className="[color:#9CA3AF] [line-height:1.7] [font-size:0.85rem] [margin-bottom:1.5rem]">
            {t('footer.description')}
          </p>
          <div className="[display:flex] [gap:0.75rem]">
            {[Globe, MessageCircle, Share2].map((Icon, i) =>
            <button
              key={i}
              type="button"

              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-[#374151] bg-transparent text-[#9CA3AF] transition hover:border-[var(--color-gold)] hover:text-white">

                <Icon size={14} />
              </button>
            )}
          </div>
        </div>

        <FooterLinks title={t('footer.services')} links={services} />
        <FooterLinks title={t('footer.company')} links={company} />

        <div>
          <h3 className="[font-family:var(--font-heading)] [color:#FFFFFF] [letter-spacing:1px] [font-size:1rem] [margin-bottom:1.25rem] [font-weight:400]">{t('footer.contact')}</h3>
          <div className="[display:flex] [flex-direction:column] [gap:1rem]">
            {[
            { Icon: MapPin, text: 'Jl. Raya Pariwisata No. 99, Bandung' },
            { Icon: Phone, text: '+62 812-3456-7890' },
            { Icon: Mail, text: 'support@ngninep.id' }].
            map(({ Icon, text }) =>
            <div key={text} className="[display:flex] [gap:0.75rem] [color:#9CA3AF] [font-size:0.85rem] [align-items:flex-start]">
                <Icon size={16} className="[color:var(--color-gold)] [flex-shrink:0] [margin-top:2px]" />
                <span>{text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="[border-top:1px_solid_rgba(255,255,255,0.08)] [padding:1.5rem] [background:#071626] [display:flex] [flex-wrap:wrap] [align-items:center] [justify-content:center] [gap:1rem] [text-align:center]">
        <span className="[color:#6B7280] [font-size:0.75rem]">
          Copyright {new Date().getFullYear()} NgiNep Corp. {t('footer.rights')}
        </span>
        <span className="[color:#6B7280] [font-size:0.75rem] [display:flex] [align-items:center] [gap:0.25rem]">
          {t('footer.madeFor')} <Heart size={10} className="[color:var(--color-gold)] [fill:var(--color-gold)]" />
        </span>
      </div>
    </footer>);

};

const FooterLinks = ({ title, links }) =>
<div>
    <h3 className="[font-family:var(--font-heading)] [color:#FFFFFF] [letter-spacing:1px] [font-size:1rem] [margin-bottom:1.25rem] [font-weight:400]">{title}</h3>
    {links.map((link) =>
  <Link
    key={link.text}
    to={link.to}

    className="mb-3 block text-[0.85rem] text-[#9CA3AF] no-underline transition-colors hover:text-[var(--color-gold)]">

        {link.text}
      </Link>
  )}
  </div>;


export default Footer;
