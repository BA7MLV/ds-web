export const getImageRequestHints = ({ role } = {}) => {
  if (role === 'hero') {
    return {
      loading: 'eager',
      fetchPriority: 'high',
    }
  }

  return {
    loading: 'lazy',
    fetchPriority: 'auto',
  }
}
