import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import DishDetailPage from './pages/DishDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:catId" element={<CategoryPage />} />
          <Route path="/dish/:dishId" element={<DishDetailPage />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}
