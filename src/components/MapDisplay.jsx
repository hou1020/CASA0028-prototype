import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Map, Source, Layer, Popup, NavigationControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

// 1. 定义全局统一的颜色映射 (确保与 Sidebar 一致)
const CATEGORY_COLOR_MAP = [
  'match',
  ['get', 'charity_purpose'],
  '儿童与青少年', '#3b82f6',
  '无家可归者救助', '#f97316',
  '医疗与残障支持', '#10b981',
  '老年人援助', '#8b5cf6',
  '宗教信仰组织', '#64748b',
  '综合贫困救助', '#ef4444',
  '#94a3b8' // 默认颜色
];

const MapDisplay = ({ data }) => {
  const [hoverInfo, setHoverInfo] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -0.1278, // 默认伦敦中心
    latitude: 51.5074,
    zoom: 10
  });

  // 2. 自动定位功能：组件加载时获取用户位置
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setViewState({
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          zoom: 13 // 定位后放大地图
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

  // 3. 修改样式：使用动态颜色
  const layerStyle = {
    id: 'foodbank-points',
    type: 'circle',
    paint: {
      'circle-radius': 8,
      'circle-color': CATEGORY_COLOR_MAP, // 👈 核心：颜色随分类变化
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
        {/* 右上角添加缩放和定位控件 */}
        <NavigationControl position="top-right" />
        <GeolocateControl 
          position="top-right" 
          trackUserLocation={true} 
          showUserHeading={true}
        />

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
              <h4>{hoverInfo.feature.name || hoverInfo.feature.organisation_name}</h4>
              <p className="category-tag" style={{borderLeft: `4px solid ${CATEGORY_COLOR_MAP[CATEGORY_COLOR_MAP.indexOf(hoverInfo.feature.charity_purpose)+1] || '#94a3b8'}`}}>
                <strong>类别:</strong> {hoverInfo.feature.charity_purpose}
              </p>
              <p><strong>地址:</strong> {hoverInfo.feature.address}</p>
              
              {/* 4. 导航功能指引：一键跳转谷歌地图导航 */}
              <a 
                className="nav-button"
                href={`https://www.google.com/maps/dir/?api=1&destination=${hoverInfo.lat},${hoverInfo.lng}`} 
                target="_blank" 
                rel="noreferrer"
              >
                🗺️ 开启导航 (离我最近路线)
              </a>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapDisplay;