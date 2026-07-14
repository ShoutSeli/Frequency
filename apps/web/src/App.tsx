import { Routes, Route } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { Footer } from '@/components/Footer';
import { Home } from '@/pages/Home';
import { Search } from '@/pages/Search';
import { Browse } from '@/pages/Browse';
import { TitleDetail } from '@/pages/TitleDetail';
import { Sports } from '@/pages/Sports';
import { LiveTV } from '@/pages/LiveTV';
import { Radio } from '@/pages/Radio';
import { Music } from '@/pages/Music';
import { Watchlist } from '@/pages/Watchlist';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Pricing } from '@/pages/Pricing';
import { TimeCapsule } from '@/pages/TimeCapsule';
import { Profile } from '@/pages/Profile';
import { NotFound } from '@/pages/NotFound';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/browse/:kind" element={<Browse />} />
          <Route path="/title/:type/:id" element={<TitleDetail />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/live-tv" element={<LiveTV />} />
          <Route path="/radio" element={<Radio />} />
          <Route path="/music" element={<Music />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/time-capsule" element={<TimeCapsule />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
