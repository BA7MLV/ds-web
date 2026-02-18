<script setup>
import { onMounted } from 'vue'

const LA_51_ID = import.meta.env.VITE_LA_51_ID
const LA_51_CK = import.meta.env.VITE_LA_51_CK

onMounted(() => {
  if (!LA_51_ID || LA_51_ID === 'undefined' || typeof window === 'undefined') {
    return
  }

  if (window.LA && window.LA.init) return

  const script = document.createElement('script')
  script.id = 'LA_COLLECT'
  script.charset = 'UTF-8'
  script.src = '//sdk.51.la/js-sdk-pro.min.js'
  
  script.onload = () => {
    if (window.LA && window.LA.init) {
      window.LA.init({
        id: LA_51_ID,
        ck: LA_51_CK || LA_51_ID
      })
      console.log('[Analytics] 51.la initialized for docs')
    }
  }

  document.head.appendChild(script)
})
</script>

<template>
</template>
