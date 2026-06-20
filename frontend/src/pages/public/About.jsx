import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Award, Users } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';

const About = () => {
  const { t } = usePreferences();
  const values = t('about.values');
  const icons = [
  { icon: ShieldCheck, wrapperClass: 'bg-emerald-500/10', iconClass: 'text-[#38A169]' },
  { icon: Heart, wrapperClass: 'bg-red-500/10', iconClass: 'text-[#E53E3E]' },
  { icon: Award, wrapperClass: 'bg-amber-400/10', iconClass: 'text-[var(--color-primary)]' },
  { icon: Users, wrapperClass: 'bg-blue-600/10', iconClass: 'text-[#2B6CB0]' }];


  return (
    <div className="about-page [min-height:100vh] [background:var(--color-background)] [padding:6rem_1.5rem]">
      <div className="about-shell [max-width:850px] [margin:0_auto]">
        
        {/* Title Section */}
        <div className="reveal [text-align:center] [margin-bottom:5rem]">
          <span className="[font-family:var(--font-body)] [font-weight:400] [color:var(--color-primary)] [text-transform:uppercase] [letter-spacing:2px] [font-size:0.8rem]">{t('about.eyebrow')}</span>
          <h1 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:clamp(2.5rem,_5vw,_4rem)] [margin-top:0.5rem] [margin-bottom:1.5rem] [line-height:1.1]">
            {t('about.title')} <span className="[color:var(--color-primary)] [font-style:italic]">NgiNep.</span>
          </h1>
          <p className="[color:var(--color-muted)] [font-weight:300] [font-size:1.1rem] [max-width:650px] [margin:0_auto] [line-height:1.8]">
            {t('about.intro')}
          </p>
        </div>

        {/* Story Section */}
        <div className="card reveal flow-animate about-story-card [padding:3rem] [margin-bottom:4rem] [border:1px_solid_var(--color-accent)]">
          <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:1.8rem] [margin-bottom:1.5rem] [color:var(--color-text)]">{t('about.missionTitle')}</h2>
          <p className="[color:var(--color-text)] [font-weight:300] [line-height:1.9] [margin-bottom:1.5rem] [font-size:0.95rem]">
            {t('about.mission1')}
          </p>
          <p className="[color:var(--color-text)] [font-weight:300] [line-height:1.9] [font-size:0.95rem]">
            {t('about.mission2')}
          </p>
        </div>

        {/* Value Grid */}
        <div className="reveal [margin-bottom:5rem]">
          <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:2rem] [text-align:center] [margin-bottom:3rem] [color:var(--color-text)]">{t('about.valuesTitle')}</h2>
          <div className="about-value-grid [display:grid] [grid-template-columns:repeat(auto-fit,_minmax(350px,_1fr))] [gap:2rem]">
            {values.map((v, i) => {
              const meta = icons[i];
              const Icon = meta.icon;
              return (
                <div key={i} className="card card-hover [padding:2rem] [display:flex] [flex-direction:column] [gap:1rem] [border:1px_solid_var(--color-accent)]">
                  <div className={`flex size-12 items-center justify-center rounded-full ${meta.wrapperClass}`}>
                    <Icon size={20} className={meta.iconClass} />
                  </div>
                  <h3 className="[font-family:var(--font-heading)] [font-weight:400] [font-size:1.3rem] [margin:0] [color:var(--color-text)]">{v.title}</h3>
                  <p className="[color:var(--color-muted)] [font-weight:300] [font-size:0.875rem] [line-height:1.7] [margin:0]">{v.desc}</p>
                </div>);

            })}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="reveal about-cta-panel [border-radius:var(--radius-sm)] [padding:3.5rem_2rem] [color:white] [text-align:center] [box-shadow:var(--shadow-hover)]">
          <h2 className="[font-family:var(--font-heading)] [font-weight:300] [font-size:2.2rem] [color:white] [margin-bottom:1rem]">{t('about.ctaTitle')}</h2>
          <p className="[color:rgba(255,255,255,0.7)] [font-weight:300] [margin-bottom:2.5rem] [max-width:500px] [margin:0_auto_2.5rem] [font-size:0.95rem]">{t('about.ctaText')}</p>
          <div className="[display:flex] [gap:1.5rem] [justify-content:center] [flex-wrap:wrap]">
            <Link to="/hotels" className="btn btn-primary [background:var(--color-primary)]">{t('about.explore')}</Link>
            <Link to="/register" className="btn btn-white border-white/30 bg-transparent text-white hover:bg-white/10">{t('about.createAccount')}</Link>
          </div>
        </div>

      </div>
    </div>);

};

export default About;
