import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './HomePage';
import { TrisectApp } from './apps/trisect/TrisectApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/trisect" element={<TrisectApp />} />
      </Routes>
    </BrowserRouter>
  );
}
