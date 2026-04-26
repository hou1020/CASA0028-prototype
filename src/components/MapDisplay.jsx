import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Map, Source, Layer, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const categoryColors = {
  "Children and Young People": "#3b82f6",
  "Homelessness Support": "#f97316",
  "Health and Disability Support": "#10b981",
  "Older People Support": "#8b5cf6",
  "Faith-Based Organisations": "#64748b",
  "Poverty Relief": "#ef4444"
};

const CATEGORY_COLOR_MAP = [
  'match',
  ['get', 'charity_purpose'],
  'Children and Young People', '#3b82f6',
  'Homelessness Support', '#f97316',
  'Health and Disability Support', '#10b981',
  'Older People Support', '#8b5cf6',
  'Faith-Based Organisations', '#64748b',
  'Poverty Relief', '#ef4444',
  '#94a3b8' 
];

const MapDisplay = ({ data }) => {
  const [hoverInfo, setHoverInfo] = useState(null);
  const closeTimerRef = useRef(null);
  const [viewState, setViewState] = useState({
    longitude: -2.0, latitude: 54.0, zoom: 5.5
  });

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const schedulePopupClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setHoverInfo(null);
      closeTimerRef.current = null;
    }, 250);
  }, [clearCloseTimer]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setViewState({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          zoom: 12
        });
      });
    }
  }, []);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  const geojsonData = useMemo(() => ({
    type: 'FeatureCollection',
    features: data.map(bank => {
      const [lat, lng] = bank.lat_lng.split(',').map(Number);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          ...bank,
          needsTagsJson: JSON.stringify(bank.needsTags) 
        }
      };
    })
  }), [data]);

  const layerStyle = {
    id: 'foodbank-points',
    type: 'circle',
    paint: {
      'circle-radius': ['case', ['get', 'isUrgent'], 12, 8],
      'circle-color': CATEGORY_COLOR_MAP,
      'circle-stroke-width': ['case', ['get', 'isUrgent'], 4, 2],
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.9
    }
  };

  const onHover = useCallback(event => {
    const { features, lngLat: { lng, lat } } = event;
    const hoveredFeature = features && features[0];
    if (hoveredFeature) {
      clearCloseTimer();
      setHoverInfo({ feature: hoveredFeature.properties, lng, lat });
    } else {
      schedulePopupClose();
    }
  }, [clearCloseTimer, schedulePopupClose]);

  const renderNeedsIcons = (tagsJson) => {
    const tags = JSON.parse(tagsJson || "{}");
    const icons = [
      { key: "Staple Foods and Grains", icon: "🍚", label: "Staples" },
      { key: "Protein and Canned Goods", icon: "🥩", label: "Protein" },
      { key: "Beverages and Seasonings", icon: "☕", label: "Drinks" },
      { key: "Hygiene Products", icon: "🧼", label: "Hygiene" },
      { key: "Maternal and Infant Products", icon: "🍼", label: "Baby and Maternal" }
    ];

    return (
      <div className="popup-needs-icons">
        {icons.map(item => (
          <span 
            key={item.key} 
            title={item.label}
            className={`popup-need-icon ${tags[item.key] ? 'active' : ''}`}
          >
            {item.icon}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="map-wrapper">
      <Map
        {...viewState}
        minZoom={5.5}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={['foodbank-points']}
        onMouseMove={onHover}
        onMouseLeave={schedulePopupClose}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" trackUserLocation={true} />

        <Source id="foodbanks" type="geojson" data={geojsonData}>
          <Layer {...layerStyle} />
        </Source>

        {hoverInfo && (
          <Popup
            longitude={hoverInfo.lng}
            latitude={hoverInfo.lat}
            closeButton={false}
            className="custom-popup"
          >
            <div
              className="popup-content"
              onMouseEnter={clearCloseTimer}
              onMouseLeave={schedulePopupClose}
            >
              
              {hoverInfo.feature.isUrgent && (
                <div className="popup-urgent-badge">
                  🔥 Urgent need (updated within 14 days)
                </div>
              )}

              <h4 className="popup-title">
                {hoverInfo.feature.name || hoverInfo.feature.organisation_name}
              </h4>

              <div
                className="popup-category"
                style={{ borderLeftColor: categoryColors[hoverInfo.feature.charity_purpose] || '#94a3b8' }}
              >
                <strong>Service category:</strong> {hoverInfo.feature.charity_purpose}
              </div>

              <div className="popup-needs-card">
                <div className="popup-needs-title">Current urgent needs:</div>
                {renderNeedsIcons(hoverInfo.feature.needsTagsJson)}
              </div>

              <div className="popup-contact">
                <p>📍 {hoverInfo.feature.address}</p>
                {hoverInfo.feature.phone_number && (
                  <p className="popup-phone">
                    📞 <a href={`tel:${hoverInfo.feature.phone_number}`}>{hoverInfo.feature.phone_number}</a>
                  </p>
                )}
              </div>

              <div className="popup-actions">
                
                {hoverInfo.feature.url && (
                  <a href={hoverInfo.feature.url} target="_blank" rel="noreferrer" 
                     className="popup-website-link">
                    🌐 Visit official website →
                  </a>
                )}

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hoverInfo.lat},${hoverInfo.lng}`}
                  target="_blank" rel="noreferrer"
                  className="popup-directions-link"
                >
                  <div>
                    <span>Get directions</span>
                    <span>Plan your route in Google Maps</span>
                  </div>
                </a>
              </div>

            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapDisplay;
