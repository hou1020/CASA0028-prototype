import React, { useState, useCallback, useMemo } from 'react';
import { Map, Source, Layer, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const MapDisplay = ({ data }) => {
  const [hoverInfo, setHoverInfo] = useState(null);

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
      'circle-radius': 6,
      'circle-color': '#3b82f6',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
      'circle-opacity': 0.8
    }
  };

  return (
    <div className="map-wrapper">
      <Map
        initialViewState={{ longitude: -2.0, latitude: 54.0, zoom: 5.5 }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={['foodbank-points']}
        onMouseMove={onHover}
        onMouseLeave={() => setHoverInfo(null)}
      >
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
            <div className="popup-content">
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                {hoverInfo.feature.name || hoverInfo.feature.organisation_name}
              </h4>
  
              <p style={{ margin: '4px 0', fontSize: '13px' }}>
                <strong>服务对象:</strong> {hoverInfo.feature.charity_purpose || '无特殊说明'}
              </p>
              <p style={{ margin: '4px 0', fontSize: '13px' }}>
                <strong>📍 地址:</strong> {hoverInfo.feature.address}
              </p>
              {hoverInfo.feature.phone_number && (
                <p style={{ margin: '4px 0', fontSize: '13px' }}>
                  <strong>📞 电话:</strong> {hoverInfo.feature.phone_number}
                </p>
              )}
  
              {/* 动作链接区：顶部分隔线 */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* 1. 官方网站链接 (恢复原位并强化显示) */}
                {hoverInfo.feature.url && (
                  <a 
                    href={hoverInfo.feature.url} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ 
                      color: '#2563eb', 
                      textDecoration: 'none', 
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '6px',
                      outline: 'none'
                    }}
                  >
                    🌐 访问官方网站
                  </a>
                )}

                {/* 2. 谷歌地图导航卡片 */}
                {hoverInfo.feature.lat_lng && (
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${hoverInfo.feature.lat_lng}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '8px',
                      textDecoration: 'none',
                      border: '1px solid #e2e8f0',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  >
                    {/* 左侧：Google Maps Iframe 缩略图 */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginRight: '12px',
                      flexShrink: 0,
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#e2e8f0'
                    }}>
                      <iframe 
                        title="map-thumbnail"
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        src={`https://maps.google.com/maps?q=${hoverInfo.feature.lat_lng}&z=14&output=embed`}
                        style={{ pointerEvents: 'none' }} 
                      />
                    </div>

                    {/* 右侧：卡片文字说明 */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>
                        获取路线
                      </span>
                      <span style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                        在 Google Maps 中打开 →
                      </span>
                    </div>
                  </a>
                )}

              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapDisplay;