import  { memo, useEffect, useRef, useState } from 'react'
import { faker } from '@faker-js/faker'

import Item from './Item'

interface ElementInfo {
  index: number
  top: number
  bottom: number
}

const height = 60
const bufferSize = 5
const estimatedItemHeight = 80


const fakerData = () => {
  const a = []
  for (let i = 0; i < 1000; i++) {
    a.push({
      id: i,
      words: faker.lorem.words(),
      paragraphs: faker.lorem.sentences(),
    })
  }

  return a
}

const VirtualizedList = memo(() => {
  // 可视区第一个元素距离顶部的偏移量
  const [startOffset, setStartOffset] = useState(0)
  // 可视区最后一个元素距离顶部的偏移量
  const [endOffset, setEndOffset] = useState(0)
  // 可视区的数据
  const [visibleData, setVisibleData] = useState<{ id: number, words: string, paragraphs: string }[]>([])

  // 缓存已渲染元素的位置信息
  const cache = useRef<ElementInfo[]>([])
  // 可视区的起始索引
  const startIndex = useRef(0)
  // 可视区的结束索引
  const endIndex = useRef(0)
  const scrollTop = useRef(0)
  // 可视区中容纳的元素个数
  const visibleCount = useRef(0)
  // 可视区
  const doc = useRef<HTMLElement | null>(null)

  const data = fakerData()

  // 锚点元素
  const anchorItem = useRef({
    index: 0, // 锚点元素的索引值
    top: 0, // 锚点元素的顶部距离第一个元素的顶部的偏移量(即 startOffset)
    bottom: 0 // 锚点元素的底部距离第一个元素的顶部的偏移量
  })

  useEffect(() => {
    /**
     * 如果固定高度，就用 height
     * 如果不固定高度，就用 estimatedItemHeight
     */
    visibleCount.current = Math.ceil(document.body.clientHeight / estimatedItemHeight) + bufferSize
    endIndex.current = startIndex.current + visibleCount.current
    updateVisibleData()

    window.addEventListener('scroll', handleScroll, false)

    // return () => {
    //   window.removeEventListener('scroll', handleScroll, false)
    // }
  }, [])

  const updateVisibleData = () => {
    const visibleData = data.slice(startIndex.current, endIndex.current)
    
    const endOffset = (data.length - endIndex.current) * estimatedItemHeight

    // update value
    setStartOffset(anchorItem.current.top)
    setEndOffset(endOffset)
    setVisibleData(visibleData)
  }

  // 计算锚点元素的位置
  const cachePosition = (node: HTMLElement, index: number) => {
    const rect = node.getBoundingClientRect()
    // rect.top 是相对于视口的顶部偏移量，window.scrollY 是相对于窗口顶部的偏移量
    const top = rect.top + window.scrollY

    cache.current.push({
      index,
      top,
      bottom: top + estimatedItemHeight
    })
  }

  // 计算 startIndex 和 endIndex
  const updateBoundaryIndex = (scrollTop = 0) => {
    // 用户正常滚动下，根据 scrollTop 找到新的锚点元素位置
    const updatedAnchorItem = cache.current.find(item => item.bottom > scrollTop)

    if (!updatedAnchorItem) {
      return
    }

    anchorItem.current = { ...updatedAnchorItem }

    startIndex.current = anchorItem.current.index
    endIndex.current = startIndex.current + visibleCount.current
  }

  // 滚动事件
  const handleScroll = () => {
    if (!doc.current) {
      doc.current = document.body.scrollTop ? document.body : document.documentElement
    }

    const docScrollTop = doc.current.scrollTop

    if (docScrollTop > scrollTop.current) {
      if (docScrollTop > anchorItem.current.bottom) {
        updateBoundaryIndex(docScrollTop)
        updateVisibleData()
      }
    } else if (docScrollTop < scrollTop.current) {
      if (docScrollTop < anchorItem.current.top) {
        updateBoundaryIndex(docScrollTop)
        updateVisibleData()
      }
    }

    scrollTop.current = (docScrollTop)

  }

  return (
    <div className='wrapper'>
      <div style={{ paddingTop: `${startOffset}px`, paddingBottom: `${endOffset}px` }}>
        {
          visibleData.map((item, index) => <Item key={item.id} item={item} index={startIndex.current + index} cachePosition={cachePosition} />)
        }
      </div>
    </div>
  )
})

export default VirtualizedList

