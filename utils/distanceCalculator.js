import { getLocationData } from "./api"

export function distanceCalculator(currentLat, currentLon, farmPostcode) {

  return getLocationData(farmPostcode)
  .then((res) => {
    const pi = (Math.PI)/180
    const cos = Math.cos
    const lon1 = currentLon
    const lat1 = currentLat
    let lon2 = res.data.result.longitude
    let lat2 = res.data.result.latitude
    let distance = 12742 * Math.asin(Math.sqrt(0.5 - cos((lat2 - lat1) * pi)/2 + cos(lat1 * pi) * cos(lat2 * pi) * (1 - cos((lon2 - lon1) * pi))/2))
    let roundedDistance = (Math.round(distance * 10) / 10).toFixed(1)
    //Math.round(distance*100)/100
    return roundedDistance
  })
  
}