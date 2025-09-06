import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import CreateResume from './pages/CreateResume'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<App />}>
    <Route index element={<Home />} />
    <Route path="create" element={<CreateResume />} />
    </Route>
  </Routes>
  </BrowserRouter>
)
