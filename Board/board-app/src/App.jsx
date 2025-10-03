import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Insertpage from './pages/board/Insertpage';
import Readpage from './pages/board/Readpage';
import Updatepage from './pages/board/Updatepage';
import Listpage from './pages/board/Listpage';


const App = () => {
  console.log("✅ App 렌더링됨");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/boards" element={<Listpage/>} />
        <Route path="/boards/insert" element={<Insertpage/>} />
        <Route path="/boards/:id" element={<Readpage/>} />
        <Route path="/boards/update/:id" element={<Updatepage/>} />
      </Routes>
    </BrowserRouter>  
  )
}

export default App