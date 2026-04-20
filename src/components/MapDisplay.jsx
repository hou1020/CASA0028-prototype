import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Map, Source, Layer, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// 1. 统一颜色映射逻辑
const CATEGORY_COLOR_MAP = [
  'match',
  ['get', 'charity_purpose'],
  '儿童与青少年', '#3b82f6',
  '无家空归者救助', '#f97316',
  '医疗与残障支持', '#10b981',
  '老年人援助', '#8b5cf6',
  '宗教信仰组织', '#64748b',
  '综合贫困救助', '#ef4444',
  '#94a3b8' // 默认颜色
];

const MapDisplay = ({ data }) => {
  const [hoverInfo, setHoverInfo] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -2.0,
    latitude: 54.0,
    zoom: 5.5
  });

  // 2. 自动定位功能
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

  const geojsonData = useMemo(() => ({
    type: 'FeatureCollection',
    features: data.map(bank => {
      const [lat, lng] = bank.lat_lng.split(',').map(Number);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: bank
      };
    })
  }), [data]);

  const onHover = useCallback(event => {
    const { features, lngLat: { lng, lat } } = event;
    const hoveredFeature = features && features[0];
    setHoverInfo(hoveredFeature ? { feature: hoveredFeature.properties, lng, lat } : null);
  }, []);

  const layerStyle = {
    id: 'foodbank-points',
    type: 'circle',
    paint: {
      'circle-radius': 8,
      'circle-color': CATEGORY_COLOR_MAP, // 使用你的变色逻辑
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.9
    }
  };

  return (
    <div className="map-wrapper">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={['foodbank-points']}
        onMouseMove={onHover}
        onMouseLeave={() => setHoverInfo(null)}
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
            <div className="popup-content" style={{ minWidth: '220px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>
                {hoverInfo.feature.name || hoverInfo.feature.organisation_name}
              </h4>

              {/* 融合：带有颜色条的分类标签 */}
              <div style={{ 
                margin: '8px 0', 
                padding: '4px 8px', 
                fontSize: '12px', 
                backgroundColor: '#f1f5f9',
                borderLeft: `4px solid ${categoryColors[hoverInfo.feature.charity_purpose] || '#94a3b8'}` 
              }}>
                <strong>类别:</strong> {hoverInfo.feature.charity_purpose || '常规援助'}
              </div>

              <p style={{ margin: '4px 0', fontSize: '13px' }}>📍 {hoverInfo.feature.address}</p>
              {hoverInfo.feature.phone_number && (
                <p style={{ margin: '4px 0', fontSize: '13px' }}>📞 {hoverInfo.feature.phone_number}</p>
              )}

              {/* 操作区：保留她写的精美卡片导航 */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hoverInfo.feature.url && (
                  <a href={hoverInfo.feature.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                    🌐 访问官方网站
                  </a>
                )}

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hoverInfo.feature.lat_lng}`}
                  target="_blank" 
                  rel="noreferrer"
                  style={{ 
                    display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', 
                    borderRadius: '8px', padding: '6px', textDecoration: 'none', border: '1px solid #e2e8f0' 
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', marginRight: '10px', flexShrink: 0 }}>
                    <iframe title="nav" width="100%" height="100%" frameBorder="0" src={`https://maps.google.com/maps?q=${hoverInfo.feature.lat_lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#1e293b' }}>获取路线</span>
                    <span style={{ fontSize: '11px', color: '#3b82f6' }}>Google Maps 导航 →</span>
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

// 辅助颜色获取（用于弹窗标签）
const categoryColors = {
  "儿童与青少年": "#3b82f6", "无家空归者救助": "#f97316", "医疗与残障支持": "#10b981",
  "老年人援助": "#8b5cf6", "宗教信仰组织": "#64748b", "综合贫困救助": "#ef4444"
};

export default MapDisplay;