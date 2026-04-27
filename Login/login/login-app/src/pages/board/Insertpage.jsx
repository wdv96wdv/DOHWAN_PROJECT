import React from 'react'
import InsertContainer from '../../container/board/InsertContainer'
import { Helmet } from 'react-helmet-async'

const Insertpage = () => {
  return (
    <>
      <Helmet>
        <title>Dorunning | 커뮤니티 | 글쓰기</title>
        <meta name="description" content="러닝 팁, 대회 후기 등 나만의 러닝 이야기를 커뮤니티에 공유해보세요." />
        <meta property="og:title" content="Dorunning | 커뮤니티 | 글쓰기" />
      </Helmet>
      <InsertContainer/>
    </>
  )
}

export default Insertpage