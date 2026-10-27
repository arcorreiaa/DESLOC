import L from 'leaflet'

function pinSvg(fill: string, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
    <defs>
      <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/>
      </filter>
    </defs>
    <path filter="url(#s)" d="M18 0C9.716 0 3 6.716 3 15c0 10.5 15 27 15 27s15-16.5 15-27C33 6.716 26.284 0 18 0z" fill="${fill}"/>
    ${inner}
  </svg>`
}

export const originPinIcon = L.divIcon({
  className: 'map-pin map-pin--origin',
  html: pinSvg('#1a9d6c', '<circle cx="18" cy="15" r="6" fill="#fff"/>'),
  iconSize: [36, 44],
  iconAnchor: [18, 44],
})

export const destPinIcon = L.divIcon({
  className: 'map-pin map-pin--dest',
  html: pinSvg('#e85d4c', '<rect x="13" y="11" width="10" height="10" rx="2" fill="#fff"/>'),
  iconSize: [36, 44],
  iconAnchor: [18, 44],
})

export const userPinIcon = L.divIcon({
  className: 'map-pin map-pin--user',
  html: `<span class="user-pin"><span class="user-pin__pulse"></span><span class="user-pin__core"></span></span>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})
