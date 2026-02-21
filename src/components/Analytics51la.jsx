import { useEffect } from 'react'

const LA_51_ID = import.meta.env.VITE_LA_51_ID
const LA_51_CK = import.meta.env.VITE_LA_51_CK

export const Analytics51la = () => {
  useEffect(() => {
    if (!LA_51_ID || LA_51_ID === 'undefined' || typeof window === 'undefined') {
      return
    }

    if (window.LA && window.LA.init) return
    if (document.getElementById('LA_COLLECT')) return

    const script = document.createElement('script')
    script.id = 'LA_COLLECT'
    script.charset = 'UTF-8'
    script.async = true
    script.src = 'https://sdk.51.la/js-sdk-pro.min.js'
     
    script.onload = () => {
      if (window.LA && window.LA.init) {
        window.LA.init({
          id: LA_51_ID,
          ck: LA_51_CK || LA_51_ID,
          autoTrack: true,
          hashMode: true,
        })
        console.log('[Analytics] 51.la initialized')
      }
    }

    script.onerror = () => {
      console.warn('[Analytics] Failed to load 51.la SDK')
    }

    document.head.appendChild(script)
  }, [])

  return null
}

export default Analytics51la
