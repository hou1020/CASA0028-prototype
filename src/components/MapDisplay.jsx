import React, { useState, useCallback, useMemo } from 'react';
import { Map, Source, Layer, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const MapDisplay = ({ data }) => {
  const [hoverInfo, setHoverInfo] = useState(null);

  // 将原始数据转换为 GeoJSON 格式
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
              <h4>{hoverInfo.feature.name || hoverInfo.feature.organisation_name}</h4>
  
              {/* 现在可以展示真实的慈善目的了！*/}
              <p><strong>服务对象/目的:</strong> {hoverInfo.feature.charity_purpose || '无特殊说明'}</p>
  
              <p><strong>地址:</strong> {hoverInfo.feature.address}</p>
              {hoverInfo.feature.phone_number && <p><strong>📞</strong> {hoverInfo.feature.phone_number}</p>}
  
              {/* 甚至可以加上网站链接 */}
              {hoverInfo.feature.url && (
                <p><a href={hoverInfo.feature.url} target="_blank" rel="noreferrer">访问官网</a></p>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default MapDisplay;