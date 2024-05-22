import  { memo, useEffect, useRef } from 'react'
import './index.css'

const Item = memo((props: { index: number, item: any, cachePosition: Function }) => {
  const { index, item, cachePosition } = props
  const currentElementRef = useRef(null)

  useEffect(() => {
    cachePosition(currentElementRef.current, index)
  }, [currentElementRef.current, index])

  return (
    <div className='list-item' style={{ height: 'auto' }} ref={currentElementRef}>
      <p>#${index} {item.words}</p>
      <p>{item.paragraphs}</p>
    </div>
  )
})

export default Item