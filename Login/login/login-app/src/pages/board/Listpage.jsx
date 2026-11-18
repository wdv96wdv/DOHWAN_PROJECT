import React from 'react'
import ListContainer from '../../container/board/ListContainer'
import { Helmet } from 'react-helmet-async'

const Listpage = () => {
  return (
    <>
      <Helmet>
        <title>Dorunning | ì»¤ë??ˆí‹°</title>
        <meta name="description" content="?¬ë‹ ?? ?€???„ê¸°, ?¥ë¹„ ë¦¬ë·° ???¬ë„ˆ?¤ê³¼ ?¤ì–‘???´ì•¼ê¸°ë? ?˜ëˆ„?´ë³´?¸ìš”. ?¨ê»˜ ?¬ë¦¬??ì¦ê±°?€??ê³µìœ ?˜ëŠ” ì»¤ë??ˆí‹°?…ë‹ˆ??" />
        <meta property="og:title" content="Dorunning | ì»¤ë??ˆí‹°" />
        <meta property="og:description" content="?¬ë„ˆ?¤ê³¼ ?¨ê»˜ ?¤ì–‘???¬ë‹ ?´ì•¼ê¸°ë? ?˜ëˆ„?´ë³´?¸ìš”." />
        <link rel="canonical" href="https://www.dorunning.app/boards" />
      </Helmet>
      <ListContainer/>
    </>
  )
}

export default Listpage