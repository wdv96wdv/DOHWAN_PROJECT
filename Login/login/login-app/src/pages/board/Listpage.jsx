import React from 'react'
import ListContainer from '../../container/board/ListContainer'
import { Helmet } from 'react-helmet-async'

const Listpage = () => {
  return (
    <>
      <Helmet>
        <title>러너들의 소통 공간, 커뮤니티 - Dorunning</title>
        <meta name="description" content="러닝 팁, 대회 후기, 장비 리뷰 등 러너들과 다양한 이야기를 나누어보세요. 함께 달리는 즐거움을 공유하는 커뮤니티입니다." />
        <meta property="og:title" content="러너들의 소통 공간, 커뮤니티 - Dorunning" />
        <meta property="og:description" content="러너들과 함께 다양한 러닝 이야기를 나누어보세요." />
        <link rel="canonical" href="https://dorunning.vercel.app/boards" />
      </Helmet>
      <ListContainer/>
    </>
  )
}

export default Listpage