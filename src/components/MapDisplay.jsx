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
            <div className="popup-content">
              
              {/* 1. 紧急状态标签 */}
              {hoverInfo.feature.isUrgent && (
                <div className="popup-urgent-badge">
                  🔥 需求紧迫 (14天内有更新)
                </div>
              )}

              {/* 2. 名称 */}
              <h4 className="popup-title">
                {hoverInfo.feature.name || hoverInfo.feature.organisation_name}
              </h4>

              {/* 3. 分类标签 */}
              <div
                className="popup-category"
                style={{ borderLeftColor: categoryColors[hoverInfo.feature.charity_purpose] || '#94a3b8' }}
              >
                <strong>服务类别:</strong> {hoverInfo.feature.charity_purpose}
              </div>

              {/* 4. 物资需求展示区 */}
              <div className="popup-needs-card">
                <div className="popup-needs-title">当前急需物资：</div>
                {renderNeedsIcons(hoverInfo.feature.needsTagsJson)}
              </div>

              {/* 5. 地址与电话 */}
              <div className="popup-contact">
                <p>📍 {hoverInfo.feature.address}</p>
                {hoverInfo.feature.phone_number && (
                  <p className="popup-phone">
                    📞 <a href={`tel:${hoverInfo.feature.phone_number}`}>{hoverInfo.feature.phone_number}</a>
                  </p>
                )}
              </div>

              {/* 6. 操作链接区 */}
              <div className="popup-actions">
                
                {/* 访问官网链接 */}
                {hoverInfo.feature.url && (
                  <a href={hoverInfo.feature.url} target="_blank" rel="noreferrer" 
                     className="popup-website-link">
                    🌐 访问官方网站 →
                  </a>
                )}

                {/* Google Maps 导航卡片 */}
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hoverInfo.lat},${hoverInfo.lng}`}
                  target="_blank" rel="noreferrer"
                  className="popup-directions-link"
                >
                  <div>
                    <span>获取导航路线</span>
                    <span>在 Google Maps 中规划路径</span>
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
