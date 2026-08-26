import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLocale } from './locale-toggle'

const NetworkContext = createContext(null)

export const useNetwork = () => {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider')
  }
  return context
}

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [connectionType, setConnectionType] = useState('unknown')
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [showOfflineToast, setShowOfflineToast] = useState(false)
  const [showBackOnlineToast, setShowBackOnlineToast] = useState(false)

  const updateConnectionInfo = useCallback(() => {
    if (typeof navigator === 'undefined') return
    
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (connection) {
      const { effectiveType, saveData } = connection
      setConnectionType(effectiveType || 'unknown')
      setIsSlowConnection(['2g', 'slow-2g'].includes(effectiveType) || saveData)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineToast(false)
      setShowBackOnlineToast(true)
      setTimeout(() => setShowBackOnlineToast(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineToast(true)
      setShowBackOnlineToast(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    updateConnectionInfo()

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo)
      }
    }
  }, [updateConnectionInfo])

  const dismissOfflineToast = useCallback(() => {
    setShowOfflineToast(false)
  }, [])

  const value = {
    isOnline,
    connectionType,
    isSlowConnection,
    showOfflineToast,
    showBackOnlineToast,
    dismissOfflineToast,
  }

  return (
    <NetworkContext.Provider value={value}>
      {children}
      <NetworkToast 
        showOffline={showOfflineToast}
        showBackOnline={showBackOnlineToast}
        onDismiss={dismissOfflineToast}
      />
    </NetworkContext.Provider>
  )
}

const NetworkToast = ({
  showOffline,
  showBackOnline,
  onDismiss,
}) => {
  const { t } = useLocale()
  if (!showOffline && !showBackOnline) return null

  return (
    <div
      className="fixed top-4 left-1/2 z-overlay -translate-x-1/2 rounded-xl border border-[color:var(--apple-line)] bg-[color:var(--apple-card)] px-4 py-3 text-[color:var(--apple-ink)] shadow-[var(--apple-shadow-md)] transition-opacity duration-200"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        {showOffline ? (
          <>
            <svg className="h-5 w-5 shrink-0 text-[color:var(--apple-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">{t('network.offline', '网络连接已断开')}</span>
            <button
              type="button"
              onClick={onDismiss}
              className="ml-1 rounded-md p-1 text-[color:var(--apple-muted)] transition-colors duration-150 hover:bg-[color:var(--apple-btn-secondary-bg)] hover:text-[color:var(--apple-ink)]"
              aria-label={t('network.dismiss', '关闭提示')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <svg className="h-5 w-5 shrink-0 text-[color:var(--apple-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">{t('network.backOnline', '网络已恢复')}</span>
          </>
        )}
      </div>
    </div>
  )
}

export default NetworkProvider
