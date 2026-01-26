import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ThemeProvider from "./components/ThemeProvider";
import OfflineIndicator from "./components/OfflineIndicator";
import Index from "./pages/Index";
import Login from "./pages/Login";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Agenda from "./pages/Agenda";
import AgendaDetail from "./pages/AgendaDetail";
import Profile from "./pages/Profile";
import Gallery from "./pages/Gallery";
import LayananDigital from "./pages/LayananDigital";
import Pengumuman from "./pages/Pengumuman";
import PengumumanDetail from "./pages/PengumumanDetail";
import PageDetail from "./pages/PageDetail";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNews from "./pages/admin/AdminNews";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminMenus from "./pages/admin/AdminMenus";
import AdminPages from "./pages/admin/AdminPages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminTheme from "./pages/admin/AdminTheme";
import AdminServices from "./pages/admin/AdminServices";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/berita" element={<News />} />
          <Route path="/berita/:slug" element={<NewsDetail />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/agenda/:slug" element={<AgendaDetail />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/galeri" element={<Gallery />} />
          <Route path="/layanan-digital" element={<LayananDigital />} />
          <Route path="/pengumuman" element={<Pengumuman />} />
          <Route path="/pengumuman/:slug" element={<PengumumanDetail />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/pages/:slug" element={<PageDetail />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/menu" element={
            <ProtectedRoute requireAdmin>
              <AdminMenus />
            </ProtectedRoute>
          } />
          <Route path="/admin/pages" element={
            <ProtectedRoute requireAdmin>
              <AdminPages />
            </ProtectedRoute>
          } />
          <Route path="/admin/news" element={
            <ProtectedRoute requireAdmin>
              <AdminNews />
            </ProtectedRoute>
          } />
          <Route path="/admin/announcements" element={
            <ProtectedRoute requireAdmin>
              <AdminAnnouncements />
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute requireAdmin>
              <AdminEvents />
            </ProtectedRoute>
          } />
          <Route path="/admin/gallery" element={
            <ProtectedRoute requireAdmin>
              <AdminGallery />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute requireAdmin>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute requireAdmin>
              <AdminProfile />
            </ProtectedRoute>
          } />
          <Route path="/admin/theme" element={
            <ProtectedRoute requireAdmin>
              <AdminTheme />
            </ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute requireAdmin>
              <AdminServices />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

