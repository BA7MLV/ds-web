import lqipMap from '../data/lqip-map.json'

export const getLQIP = (imagePath) => {
  return lqipMap[imagePath] || null
}

export default getLQIP
