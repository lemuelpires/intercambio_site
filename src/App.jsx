import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Boston from './pages/Boston'
import NewYork from './pages/NewYork'
import Retorno from './pages/Retorno'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="boston" element={<Boston />} />
        <Route path="newyork" element={<NewYork />} />
        <Route path="retorno" element={<Retorno />} />
      </Route>
    </Routes>
  )
}
