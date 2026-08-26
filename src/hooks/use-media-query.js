import { useSyncExternalStore } from 'react'

import { subscribeToMediaQueryChange } from '../lib/media-query-subscribe'

/**
 * Subscribe to a CSS media query and return whether it currently matches.
 * @param {string} query
 * @returns {boolean}
 */
export const useMediaQuery = (query) => {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return () => {}
      }
      const mediaQueryList = window.matchMedia(query)
      return subscribeToMediaQueryChange(mediaQueryList, onStoreChange)
    },
    () => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false
      }
      return window.matchMedia(query).matches
    },
    () => false,
  )
}
