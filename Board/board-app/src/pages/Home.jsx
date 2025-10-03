import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
    console.log("✅ Home 컴포넌트 렌더링됨");
  return (
    <>
    <div className='container'>  
      <h1>Board App</h1>
      <h2>* 게시판 앱</h2>
    
    <Link to="/boards" className='btn'>게시판</Link>
    </div>
    </>
  )
}

export default Home