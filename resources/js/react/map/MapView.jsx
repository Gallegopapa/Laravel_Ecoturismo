import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapView({ locations }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const setCat = new Set();
    locations.forEach(l => {
      if (l.categories && l.categories.length > 0) {
        l.categories.forEach(cat => setCat.add(cat.name));
      }
    });
    return Array.from(setCat);
  }, [locations]);

  const filtered = locations.filter(l => {
    const matchQuery = 
      (l.name || '').toLowerCase().includes(query.toLowerCase()) || 
      (l.description || '').toLowerCase().includes(query.toLowerCase()) ||
      (l.location || '').toLowerCase().includes(query.toLowerCase());
    
    const matchCat = category === 'all' 
      ? true 
      : l.categories && l.categories.some(cat => cat.name === category);
    
    return matchQuery && matchCat && l.latitude && l.longitude;
  });

  // Centro por defecto: Risaralda, Colombia
  const center = filtered.length > 0 
    ? [filtered[0].latitude, filtered[0].longitude] 
    : [4.814, -75.694];

  return (
    <div className="map-view-container">
      <div className="map-controls">
        <input 
          type="text"
          placeholder="Buscar lugar, descripción o ubicación..." 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          className="map-search-input"
        />
        <select 
          value={category} 
          onChange={e => setCategory(e.target.value)} 
          className="map-category-select"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <MapContainer 
        center={center} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
        />

        {filtered.map(loc => (
          <Marker 
            key={loc.id} 
            position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
          >
            <Popup>
              <div className="map-popup-content">
                <h3>{loc.name}</h3>
                {loc.location && (
                  <p className="map-popup-location">📍 {loc.location}</p>
                )}
                {loc.description && (
                  <p className="map-popup-description">
                    {loc.description.length > 150 
                      ? loc.description.substring(0, 150) + '...' 
                      : loc.description}
                  </p>
                )}
                {loc.image && (
                  <img 
                    src={loc.image} 
                    alt={loc.name} 
                    className="map-popup-image"
                    onError={(e) => {
                      e.target.src = 'https://picsum.photos/200/150';
                    }}
                  />
                )}
                {loc.categories && loc.categories.length > 0 && (
                  <div className="map-popup-categories">
                    {loc.categories.map(cat => (
                      <span key={cat.id} className="map-category-badge">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="map-popup-actions">
                  <Link 
                    to={`/lugares/${loc.id}`} 
                    className="map-popup-link"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

