import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import * as THREE from 'three'

type Hub = { lat: number; lng: number }

const HUBS: Record<string, Hub> = {
  // Africa
  lagos: { lat: 6.52, lng: 3.38 },
  nairobi: { lat: -1.28, lng: 36.82 },
  accra: { lat: 5.56, lng: -0.20 },
  dakar: { lat: 14.69, lng: -17.44 },
  tunis: { lat: 33.88, lng: 9.54 },
  addis: { lat: 9.02, lng: 38.74 },
  maputo: { lat: -25.96, lng: 32.59 },
  joburg: { lat: -26.20, lng: 28.04 },
  cairo: { lat: 30.04, lng: 31.24 },
  casablanca: { lat: 33.57, lng: -7.59 },
  // Europe
  london: { lat: 51.50, lng: -0.12 },
  paris: { lat: 48.85, lng: 2.35 },
  frankfurt: { lat: 50.11, lng: 8.68 },
  madrid: { lat: 40.42, lng: -3.70 },
  amsterdam: { lat: 52.37, lng: 4.90 },
  warsaw: { lat: 52.23, lng: 21.01 },
  // North America
  nyc: { lat: 40.71, lng: -74.01 },
  chicago: { lat: 41.88, lng: -87.63 },
  la: { lat: 34.05, lng: -118.24 },
  toronto: { lat: 43.65, lng: -79.38 },
  miami: { lat: 25.77, lng: -80.19 },
  // South America
  saopaulo: { lat: -23.55, lng: -46.63 },
  bogota: { lat: 4.71, lng: -74.07 },
  lima: { lat: -12.05, lng: -77.04 },
  buenosaires: { lat: -34.60, lng: -58.38 },
  // Asia
  dubai: { lat: 25.20, lng: 55.27 },
  mumbai: { lat: 19.08, lng: 72.88 },
  singapore: { lat: 1.35, lng: 103.82 },
  tokyo: { lat: 35.68, lng: 139.69 },
  beijing: { lat: 39.91, lng: 116.39 },
  seoul: { lat: 37.57, lng: 126.98 },
  bangkok: { lat: 13.75, lng: 100.52 },
  karachi: { lat: 24.86, lng: 67.01 },
  // Oceania
  sydney: { lat: -33.87, lng: 151.21 },
  melbourne: { lat: -37.81, lng: 144.96 },
  auckland: { lat: -36.85, lng: 174.76 },
}

type ArcDef = {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
}

const arc = (a: keyof typeof HUBS, b: keyof typeof HUBS): ArcDef => ({
  startLat: HUBS[a].lat,
  startLng: HUBS[a].lng,
  endLat: HUBS[b].lat,
  endLng: HUBS[b].lng,
})

const ARCS: ArcDef[] = [
  arc('lagos', 'nairobi'),
  arc('lagos', 'accra'),
  arc('lagos', 'dakar'),
  arc('lagos', 'joburg'),
  arc('lagos', 'tunis'),
  arc('nairobi', 'maputo'),
  arc('nairobi', 'addis'),
  arc('nairobi', 'joburg'),
  arc('cairo', 'tunis'),
  arc('cairo', 'addis'),
  arc('dakar', 'casablanca'),
  arc('casablanca', 'tunis'),
  arc('london', 'paris'),
  arc('london', 'amsterdam'),
  arc('paris', 'frankfurt'),
  arc('frankfurt', 'warsaw'),
  arc('madrid', 'paris'),
  arc('amsterdam', 'frankfurt'),
  arc('nyc', 'chicago'),
  arc('nyc', 'miami'),
  arc('nyc', 'toronto'),
  arc('chicago', 'la'),
  arc('la', 'miami'),
  arc('saopaulo', 'bogota'),
  arc('saopaulo', 'buenosaires'),
  arc('bogota', 'lima'),
  arc('lima', 'buenosaires'),
  arc('dubai', 'mumbai'),
  arc('dubai', 'singapore'),
  arc('mumbai', 'karachi'),
  arc('mumbai', 'singapore'),
  arc('singapore', 'bangkok'),
  arc('singapore', 'tokyo'),
  arc('tokyo', 'beijing'),
  arc('beijing', 'seoul'),
  arc('beijing', 'singapore'),
  arc('sydney', 'melbourne'),
  arc('sydney', 'auckland'),
  arc('lagos', 'london'),
  arc('lagos', 'paris'),
  arc('cairo', 'frankfurt'),
  arc('nairobi', 'london'),
  arc('casablanca', 'madrid'),
  arc('tunis', 'frankfurt'),
  arc('nairobi', 'dubai'),
  arc('lagos', 'dubai'),
  arc('cairo', 'dubai'),
  arc('london', 'nyc'),
  arc('paris', 'nyc'),
  arc('madrid', 'saopaulo'),
  arc('london', 'toronto'),
  arc('amsterdam', 'nyc'),
  arc('nyc', 'saopaulo'),
  arc('miami', 'bogota'),
  arc('la', 'bogota'),
  arc('london', 'dubai'),
  arc('frankfurt', 'dubai'),
  arc('frankfurt', 'mumbai'),
  arc('warsaw', 'beijing'),
  arc('london', 'singapore'),
  arc('singapore', 'sydney'),
  arc('tokyo', 'sydney'),
  arc('beijing', 'sydney'),
  arc('la', 'tokyo'),
  arc('la', 'singapore'),
  arc('nyc', 'tokyo'),
  arc('saopaulo', 'tokyo'),
  arc('lagos', 'saopaulo'),
  arc('dakar', 'miami'),
]

const HUB_POINTS: Hub[] = Object.values(HUBS)

type CountriesGeoJson = { features: object[] }

const COUNTRIES_URL =
  'https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson'

interface LoginGlobeProps {
  className?: string
}

export function LoginGlobe({ className = '' }: LoginGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [ready, setReady] = useState(false)
  const [countries, setCountries] = useState<CountriesGeoJson>({ features: [] })

  useLayoutEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })
    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((data: CountriesGeoJson) => setCountries(data))
      .catch(() => {
        // Globe still works without polygons
      })
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe || !ready) return

    const controls = globe.controls() as {
      autoRotate: boolean
      autoRotateSpeed: number
      enableZoom: boolean
      enablePan: boolean
      enableRotate: boolean
    }
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableRotate = false

    globe.pointOfView({ lat: 5, lng: 20, altitude: 1.9 }, 0)
  }, [ready])

  const globeMaterial = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        color: new THREE.Color('#050f20'),
        emissive: new THREE.Color('#0a1628'),
        specular: new THREE.Color('#1b619f'),
        shininess: 6,
        transparent: true,
        opacity: 0.95,
      }),
    [],
  )

  return (
    <div
      ref={containerRef}
      className={`size-full ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      {size.width > 0 && size.height > 0 ? (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeMaterial={globeMaterial}
          showAtmosphere
          atmosphereColor="#1b619f"
          atmosphereAltitude={0.18}
          polygonsData={countries.features}
          polygonCapColor={() => 'rgba(27,97,159,0.12)'}
          polygonSideColor={() => 'transparent'}
          polygonStrokeColor={() => 'rgba(27,97,159,0.5)'}
          polygonAltitude={0.001}
          arcsData={ARCS}
          arcColor={() => ['rgba(200,141,94,0.9)', 'rgba(27,97,159,0.9)']}
          arcDashLength={0.35}
          arcDashGap={0.15}
          arcDashAnimateTime={1800}
          arcStroke={0.5}
          arcAltitude={0.02}
          pointsData={HUB_POINTS}
          pointColor={() => '#c88d5e'}
          pointAltitude={0.008}
          pointRadius={0.45}
          pointsMerge={false}
        />
      ) : null}
    </div>
  )
}
