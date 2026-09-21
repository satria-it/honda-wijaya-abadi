import { createContext, useContext, useEffect, useState } from 'react';
import { publicApi } from '../services/api';

const SiteDataContext = createContext(null);

const defaultSettings = {
  name: "Honda Wijaya Abadi Motor",
  tagline: "Partner Terpercaya Berkendara Anda",
  phone: "6282343488319",
  address: "Jl. Raya Utama No. 123, Jakarta",
  email: "info@hondawijayaabadi.com",
  workingHours: "Senin - Sabtu: 08.00 - 17.00 WIB",
  logo: "",
  heroImage: "",
  heroTitle: "Berkendara Dengan",
  heroTitleHighlight: "Kebanggaan",
  heroSubtitle: "Partner Terpercaya Berkendara Anda. Dapatkan motor Honda impian Anda dengan harga terbaik dan proses yang mudah.",
  footerText: "Dealer resmi Honda terpercaya yang siap melayani kebutuhan kendaraan Anda dengan profesional dan amanah.",
  heroFont: "Sora",
  heroFontSize: "large",
  heroTitleColor: "",
  heroHighlightColor: "",
};

export const SiteDataProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [motors, setMotors] = useState([]);
  const [promos, setPromos] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [manifesto, setManifesto] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, m, p, t, mf] = await Promise.all([
          publicApi.getSettings(),
          publicApi.getMotors(),
          publicApi.getPromos(),
          publicApi.getTestimonials(),
          publicApi.getManifesto(),
        ]);
        setSettings({ ...defaultSettings, ...s });
        setMotors(m);
        setPromos(p);
        setTestimonials(t);
        setManifesto(mf);
      } catch (e) {
        console.error('Failed to load site data', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SiteDataContext.Provider value={{ settings, motors, promos, testimonials, manifesto, loading }}>
      {children}
    </SiteDataContext.Provider>
  );
};

export const useSiteData = () => useContext(SiteDataContext);
