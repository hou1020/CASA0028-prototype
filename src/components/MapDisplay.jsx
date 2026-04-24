import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Map, Source, Layer, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// 1. 颜色映射表（用于弹窗左侧的装饰条）
const categoryColors = {
  "儿童与青少年": "#3b82f6",
  "无家空归者救助": "#f97316",
  "医疗与残障支持": "#10b981",
  "老年人援助": "#8b5cf6",
  "宗教信仰组织": "#64748b",
  "综合贫困救助": "#ef4444"
};

// 2. 地图图层颜色逻辑
const CATEGORY_COLOR_MAP = [
  'match',
  ['get', 'charity_purpose'],
  '儿童与青少年', '#3b82f6',
  '无家空归者救助', '#f97316',
  '医疗与残障支持', '#10b981',
  '老年人援助', '#8b5cf6',
  '宗教信仰组织', '#64748b',
  '综合贫困救助', '#ef4444',
  '#94a3b8' 
];

const MapDisplay = ({ data }) => {
  const [hoverInfo, setHoverInfo] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -2.0, latitude: 54.0, zoom: 5.5
  });

  // 自动定位
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
    setHoverInfo(hoveredFeature ? { feature: hoveredFeature.properties, lng, lat } : null);
  }, []);

  // 物资图标渲染函数
  const renderNeedsIcons = (tagsJson) => {
    const tags = JSON.parse(tagsJson || "{}");
    const icons = [
      { key: "Staple Foods and Grains", icon: "🍚", label: "主食" },
      { key: "Protein and Canned Goods", icon: "🥩", label: "蛋白质" },
      { key: "Beverages and Seasonings", icon: "☕", label: "饮品" },
      { key: "Hygiene Products", icon: "🧼", label: "卫生" },
      { key: "Maternal and Infant Products", icon: "🍼", label: "母婴" }
    ];

    return (
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        {icons.map(item => (
          <span 
            key={item.key} 
            title={item.label}
            style={{ 
              filter: tags[item.key] ? 'grayscale(0)' : 'grayscale(1)', 
              opacity: tags[item.key] ? 1 : 0.15,
              fontSize: '20px'
            }}
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
            <div className="popup-content" style={{ minWidth: '250px' }}>
              
              {/* 1. 紧急状态标签 */}
              {hoverInfo.feature.isUrgent && (
                <div style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', width: 'fit-content', marginBottom: '8px', fontWeight: 'bold' }}>
                  🔥 需求紧迫 (14天内有更新)
                </div>
              )}

              {/* 2. 名称 */}
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#1e293b' }}>
                {hoverInfo.feature.name || hoverInfo.feature.organisation_name}
              </h4>

              {/* 3. 分类标签 */}
              <div style={{ 
                margin: '8px 0', padding: '4px 8px', fontSize: '11px', backgroundColor: '#f1f5f9',
                borderLeft: `4px solid ${categoryColors[hoverInfo.feature.charity_purpose] || '#94a3b8'}`,
                color: '#475569'
              }}>
                <strong>服务类别:</strong> {hoverInfo.feature.charity_purpose}
              </div>

              {/* 4. 物资需求展示区 */}
              <div style={{ margin: '12px 0', padding: '10px', backgroundColor: '#fffdf5', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 'bold', marginBottom: '4px' }}>当前急需物资：</div>
                {renderNeedsIcons(hoverInfo.feature.needsTagsJson)}
              </div>

              {/* 5. 地址与电话 */}
              <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                <p style={{ margin: '2px 0' }}>📍 {hoverInfo.feature.address}</p>
                {hoverInfo.feature.phone_number && (
                  <p style={{ margin: '4px 0', color: '#2563eb', fontWeight: 'bold' }}>
                    📞 <a href={`tel:${hoverInfo.feature.phone_number}`} style={{ color: 'inherit', textDecoration: 'none' }}>{hoverInfo.feature.phone_number}</a>
                  </p>
                )}
              </div>

              {/* 6. 操作链接区 */}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* 访问官网链接 */}
                {hoverInfo.feature.url && (
                  <a href={hoverInfo.feature.url} target="_blank" rel="noreferrer" 
                     style={{ color: '#2563eb', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🌐 访问官方网站 →
                  </a>
                )}

                {/* Google Maps 导航卡片 */}
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hoverInfo.lat},${hoverInfo.lng}`}
                  target="_blank" rel="noreferrer"
                  style={{ 
                    display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', 
                    borderRadius: '8px', padding: '8px', textDecoration: 'none', border: '1px solid #e2e8f0' 
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#1e293b' }}>获取导航路线</span>
                    <span style={{ fontSize: '10px', color: '#3b82f6' }}>在 Google Maps 中规划路径</span>
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