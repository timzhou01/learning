import { useState } from 'react'

type Item = {
  id: number
  name: string
}

const ITEM_HEIGHT = 40
const CONTAINER_HEIGHT = 400

const cache = new WeakMap()
cache.set('12', 5)

const items: Item[] = Array.from(
  { length: 10_000 },
  (_, index) => ({
    id: index,
    name: `Item ${index}`,
  }),
)

export default function App() {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.floor(
    scrollTop / ITEM_HEIGHT,
  )

  const visibleCount = Math.ceil(
    CONTAINER_HEIGHT / ITEM_HEIGHT,
  )

  // 前后多渲染几条，避免快速滚动时出现空白
  const overscan = 5

  const start = Math.max(
    0,
    startIndex - overscan,
  )

  const end = Math.min(
    items.length,
    startIndex + visibleCount + overscan,
  )

  const visibleItems = items.slice(
    start,
    end,
  )

  return (
    <div>
      <h1>Virtual List</h1>

      <div
        style={{
          height: CONTAINER_HEIGHT,
          overflowY: 'auto',
          border: '1px solid #ccc',
        }}
        onScroll={(event) => {
          setScrollTop(
            event.currentTarget.scrollTop,
          )
        }}
      >
        <div
          style={{
            height:
              items.length * ITEM_HEIGHT,
            position: 'relative',
          }}
        >
          {visibleItems.map(
            (item, index) => {
              const realIndex =
                start + index

              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top:
                      realIndex *
                      ITEM_HEIGHT,
                    left: 0,
                    right: 0,
                    height: ITEM_HEIGHT,
                    borderBottom:
                      '1px solid #eee',
                    boxSizing:
                      'border-box',
                  }}
                >
                  {item.name}
                </div>
              )
            },
          )}
        </div>
      </div>
    </div>
  )
}