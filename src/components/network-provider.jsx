import { createContext, useContext, useState, useEffect, useCallback } from 'react'

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
  if (!showOffline && !showBackOnline) return null

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-full shadow-lg backdrop-blur-xl transition-all duration-300 ${
        showOffline 
          ? 'bg-[color:var(--apple-error-bg)] text-[color:var(--apple-error-text)] border border-[color:var(--apple-error-border)]' 
          : 'bg-[color:var(--apple-success-bg)] text-[color:var(--apple-success-text)] border border-[color:var(--apple-success-border)]'
      }`}
    >
      <div className="flex items-center gap-3">
        {showOffline ? (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">网络连接已断开</span>
            <button 
              onClick={onDismiss}
              className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors"
              aria-label="关闭提示"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">网络已恢复</span>
          </>
        )}
      </div>
    </div>
  )
}

export default NetworkProvider
