import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Bike, Tag, MessageSquare, Users, Settings, LogOut, User, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { NotificationBell } from './NotificationBell';

export const AdminLayout = () => {
  const { admin, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-white">Memuat...</div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Bike, label: 'Motor', href: '/admin/motors' },
    { icon: Tag, label: 'Promo', href: '/admin/promos' },
    { icon: MessageSquare, label: 'Testimoni', href: '/admin/testimonials' },
    { icon: Sparkles, label: 'Manifesto', href: '/admin/manifesto' },
    { icon: Users, label: 'Minat Konsumen', href: '/admin/interests' },
    { icon: Settings, label: 'Pengaturan', href: '/admin/settings' },
    { icon: User, label: 'Akun Saya', href: '/admin/account' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black border-r border-white/10 flex flex-col fixed h-screen">
        <div className="p-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center font-bold text-white">
              H
            </div>
            <div>
              <div className="font-bold text-white font-['Sora'] text-sm leading-tight">Honda Wijaya</div>
              <div className="text-xs text-gray-400">Admin Panel</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                data-testid={`admin-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="mb-3 px-4 py-2">
            <div className="text-xs text-gray-500">Login sebagai</div>
            <div className="text-sm text-white font-medium truncate">{admin.username}</div>
          </div>
          <Button
            onClick={logout}
            data-testid="admin-logout-btn"
            variant="outline"
            className="w-full border-white/20 bg-transparent text-gray-400 hover:bg-red-600/10 hover:text-red-500 hover:border-red-500/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar with Notification Bell */}
        <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 flex justify-end items-center px-8 py-3">
          <NotificationBell />
        </div>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
