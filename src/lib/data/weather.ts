export interface StadiumWeather {
  temp: number
  feelsLike: number
  windMph: number
  precipIn: number
  conditionCode: number
  conditionText: string
  indoor: boolean
  stadiumName: string
}

interface StadiumCoords {
  lat: number
  lon: number
  name: string
  indoor: boolean
}

export const STADIUM_COORDS: Record<string, StadiumCoords> = {
  ARI: { lat: 33.5277, lon: -112.2626, name: "State Farm Stadium", indoor: true },
  ATL: { lat: 33.7554, lon: -84.4011, name: "Mercedes-Benz Stadium", indoor: true },
  BAL: { lat: 39.2779, lon: -76.6227, name: "M&T Bank Stadium", indoor: false },
  BUF: { lat: 42.7737, lon: -78.7870, name: "Highmark Stadium", indoor: false },
  CAR: { lat: 35.2258, lon: -80.8528, name: "Bank of America Stadium", indoor: false },
  CHI: { lat: 41.8623, lon: -87.6167, name: "Soldier Field", indoor: false },
  CIN: { lat: 39.0954, lon: -84.5160, name: "Paycor Stadium", indoor: false },
  CLE: { lat: 41.5061, lon: -81.6995, name: "Cleveland Browns Stadium", indoor: false },
  DAL: { lat: 32.7479, lon: -97.0928, name: "AT&T Stadium", indoor: false },
  DEN: { lat: 39.7439, lon: -105.0200, name: "Empower Field at Mile High", indoor: false },
  DET: { lat: 42.3400, lon: -83.0456, name: "Ford Field", indoor: true },
  GB:  { lat: 44.5013, lon: -88.0622, name: "Lambeau Field", indoor: false },
  HOU: { lat: 29.6847, lon: -95.4107, name: "NRG Stadium", indoor: true },
  IND: { lat: 39.7601, lon: -86.1639, name: "Lucas Oil Stadium", indoor: true },
  JAX: { lat: 30.3239, lon: -81.6373, name: "EverBank Stadium", indoor: false },
  KC:  { lat: 39.0489, lon: -94.4839, name: "GEHA Field at Arrowhead", indoor: false },
  LV:  { lat: 36.0909, lon: -115.1833, name: "Allegiant Stadium", indoor: true },
  LAC: { lat: 33.9535, lon: -118.3392, name: "SoFi Stadium", indoor: false },
  LAR: { lat: 33.9535, lon: -118.3392, name: "SoFi Stadium", indoor: false },
  MIA: { lat: 25.9580, lon: -80.2389, name: "Hard Rock Stadium", indoor: false },
  MIN: { lat: 44.9740, lon: -93.2577, name: "U.S. Bank Stadium", indoor: true },
  NE:  { lat: 42.0909, lon: -71.2643, name: "Gillette Stadium", indoor: false },
  NO:  { lat: 29.9511, lon: -90.0812, name: "Caesars Superdome", indoor: true },
  NYG: { lat: 40.8135, lon: -74.0745, name: "MetLife Stadium", indoor: false },
  NYJ: { lat: 40.8135, lon: -74.0745, name: "MetLife Stadium", indoor: false },
  PHI: { lat: 39.9007, lon: -75.1675, name: "Lincoln Financial Field", indoor: false },
  PIT: { lat: 40.4468, lon: -80.0158, name: "Acrisure Stadium", indoor: false },
  SF:  { lat: 37.4032, lon: -121.9698, name: "Levi's Stadium", indoor: false },
  SEA: { lat: 47.5952, lon: -122.3316, name: "Lumen Field", indoor: false },
  TB:  { lat: 27.9759, lon: -82.5033, name: "Raymond James Stadium", indoor: false },
  TEN: { lat: 36.1665, lon: -86.7713, name: "Nissan Stadium", indoor: false },
  WAS: { lat: 38.9077, lon: -76.8644, name: "Northwest Stadium", indoor: false },
}

function weatherCodeToText(code: number): string {
  if (code === 0) return "Clear"
  if (code <= 3) return "Partly Cloudy"
  if (code <= 48) return "Foggy"
  if (code <= 67) return "Rainy"
  if (code <= 77) return "Snowy"
  if (code <= 82) return "Showers"
  if (code === 95) return "Thunderstorm"
  if (code <= 99) return "Severe Storms"
  return "Unknown"
}

export async function fetchStadiumWeather(homeTeam: string): Promise<StadiumWeather | null> {
  try {
    const coords = STADIUM_COORDS[homeTeam?.toUpperCase()]
    if (!coords) return null

    if (coords.indoor) {
      return {
        temp: 72,
        feelsLike: 72,
        windMph: 0,
        precipIn: 0,
        conditionCode: 0,
        conditionText: "Clear",
        indoor: true,
        stadiumName: coords.name,
      }
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,wind_speed_10m,precipitation,weathercode,apparent_temperature&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null

    const data = await res.json()
    const current = data.current

    return {
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      windMph: Math.round(current.wind_speed_10m),
      precipIn: current.precipitation ?? 0,
      conditionCode: current.weathercode,
      conditionText: weatherCodeToText(current.weathercode),
      indoor: false,
      stadiumName: coords.name,
    }
  } catch {
    return null
  }
}
