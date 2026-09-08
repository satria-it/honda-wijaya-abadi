import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Catalog } from "@/components/Catalog";
import { Promo } from "@/components/Promo";
import { Testimonials } from "@/components/Testimonials";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { SiteDataProvider } from "@/context/SiteDataContext";
import { AdminLayout } from "@/components/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminMotors from "@/pages/admin/AdminMotors";
import AdminPromos from "@/pages/admin/AdminPromos";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminManifesto from "@/pages/admin/AdminManifesto";
import AdminInterests from "@/pages/admin/AdminInterests";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminAccount from "@/pages/admin/AdminAccount";

const Home = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <SiteDataProvider>
      <SmoothScroll>
        <div className="relative">
          <div
            className="cursor-glow hidden md:block"
            style={{
              left: `${cursorPosition.x}px`,
              top: `${cursorPosition.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
          <Header />
          <Hero />
          <Manifesto />
          <Catalog />
          <Promo />
          <Testimonials />
          <Contact />
          <Footer />
        </div>
      </SmoothScroll>
    </SiteDataProvider>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="motors" element={<AdminMotors />} />
              <Route path="promos" element={<AdminPromos />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="manifesto" element={<AdminManifesto />} />
              <Route path="interests" element={<AdminInterests />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="account" element={<AdminAccount />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
