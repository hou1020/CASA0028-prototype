import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse'; 
import Sidebar from './components/Sidebar';
import MapDisplay from './components/MapDisplay';
import './App.css';

function cleanCategory(rawText) {
  if (!rawText) return "Other / General Support";
  const text = rawText.toLowerCase();
  if (text.includes('child') || text.includes('youth') || text.includes('young') || text.includes('school')) return "Children and Young People";
  if (text.includes('homeless') || text.includes('housing') || text.includes('rough sleep')) return "Homelessness Support";
  if (text.includes('health') || text.includes('disab') || text.includes('mental') || text.includes('illness')) return "Health and Disability Support";
  if (text.includes('elderly') || text.includes('age') || text.includes('older')) return "Older People Support";
  if (text.includes('christian') || text.includes('church') || text.includes('faith') || text.includes('religion')) return "Faith-Based Organisations";
  if (text.includes('poverty') || text.includes('hardship') || text.includes('relief')) return "Poverty Relief";
  return "Other / General Support";
}

function categorizeNeeds(needsText) {
  const text = needsText ? needsText.toLowerCase() : "";
  return {
    "Staple Foods and Grains": /rice|pasta|noodles|cereal|flour|spaghetti|mash/.test(text),
    "Protein and Canned Goods": /meat|fish|beans|soup|tomatoes|vegetable|tinned|canned/.test(text),
    "Beverages and Seasonings": /milk|tea|coffee|juice|sugar|oil|sauce|squash/.test(text),
    "Hygiene Products": /shampoo|deodorant|soap|toothpaste|toilet|washing|shower|gel/.test(text),
    "Maternal and Infant Products": /baby|nappies|wipes|formula|infant/.test(text)
  };
}

function checkUrgency(timestamp) {
  if (!timestamp) return false;
  const lastFound = new Date(timestamp);
  const now = new Date();
  const diffDays = (now - lastFound) / (1000 * 60 * 60 * 24);
  return diffDays <= 14; 
}

function getDistanceMiles(origin, latLngText) {
  if (!origin || !latLngText) return null;

  const [lat, lng] = latLngText.split(',').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const earthRadiusMiles = 3958.8;
  const toRadians = (value) => (value * Math.PI) / 180;
  const latDistance = toRadians(lat - origin.latitude);
  const lngDistance = toRadians(lng - origin.longitude);
  const startLat = toRadians(origin.latitude);
  const endLat = toRadians(lat);

  const a = Math.sin(latDistance / 2) ** 2 +
            Math.cos(startLat) * Math.cos(endLat) *
            Math.sin(lngDistance / 2) ** 2;
  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function FoodbankPage({ role }) {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(() => (
    typeof navigator !== 'undefined' && "geolocation" in navigator ? 'checking' : 'unsupported'
  ));

  useEffect(() => {
    Papa.parse('/foodbanks.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data
          .filter(b => b.lat_lng)
          .map(bank => {
            return {
              ...bank,
              charity_purpose: cleanCategory(bank.charity_purpose),
              needsTags: categorizeNeeds(bank.needed_items),
              isUrgent: checkUrgency(bank.need_found)
            };
          });
        setAllData(processedData);
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!(typeof navigator !== 'undefined' && "geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationStatus('ready');
      },
      () => {
        setLocationStatus('unavailable');
      }
    );
  }, []);

  const categories = useMemo(() => {
    const list = allData.map(b => b.charity_purpose);
    return ['All', ...new Set(list)];
  }, [allData]);

  const filteredData = useMemo(() => {
    return allData.filter(item => {
      // 1. 类别过滤
      const matchCategory = selectedCategory === 'All' || item.charity_purpose === selectedCategory;
      
      // 2. 需求过滤
      const matchNeeds = selectedNeeds.length === 0 || 
                         selectedNeeds.every(tag => item.needsTags[tag]);

      // 3. 距离过滤
      const distanceMiles = getDistanceMiles(userLocation, item.lat_lng);
      const matchDistance = selectedDistance === 'all' ||
                            (distanceMiles !== null && distanceMiles <= Number(selectedDistance));

      // 4. 角色过滤逻辑 (新加入的)
      const hasAnySpecificNeed = Object.values(item.needsTags || {}).some(val => val === true);
      const roleFilter = role === 'volunteer' ? hasAnySpecificNeed : true;

      return matchCategory && matchNeeds && matchDistance && roleFilter;
    });
  }, [allData, selectedCategory, selectedNeeds, selectedDistance, userLocation, role]);
  
  if (loading) return <div className="loading">Building the city support network...</div>;

  const switchTarget = role === 'recipient' ? '/volunteer' : '/recipient';
  const switchLabel = role === 'recipient' ? 'Switch to Volunteer' : 'Switch to Recipient';
  const lastUpdated = new Date().toLocaleString('en-GB', {
    day: 'numeric', month: 'short'
  });

  return (
    <div className="app-container">
      <Sidebar 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedNeeds={selectedNeeds}
        onNeedsChange={setSelectedNeeds}
        role={role}
        lastUpdated={lastUpdated}
        matchingCount={filteredData.length}
        selectedDistance={selectedDistance}
        onDistanceChange={setSelectedDistance}
        locationStatus={locationStatus}
      />
      
      <a className="role-switch-button" href={switchTarget}>
        {switchLabel}
      </a>

      <MapDisplay data={filteredData} role={role} /> 
  </div>
  );
}

function HomePage() {
  return (
    <main className="home-page-v2">
      {/* 1. 引用你放在 public 下的图片 */}
      <div className="map-overlay-v3">
  <img src="/foodbankhelp.png" alt="Foodbank Help Illustration" className="map-image" />
</div>
      
      <section className="home-content">
        <header className="hero-section">
          <p className="home-kicker">Welcome to City Hearth</p>
          {/* 这里我帮你加了 <br /> 实现换行 */}
          <h1 className="home-title-v2">Pulse of Kindness:<br />Food Security Navigator</h1>
          <p className="home-subtitle">
            Connecting those in need with the warmth of the community. 
            Choose your journey to start making a difference or finding support.
          </p>
        </header>

        <div className="role-container-v2">
          {/* ... 你的两个 role-card-v2 代码保持不变 ... */}
          <a className="role-card-v2 recipient-v2" href="/recipient">
            <div className="card-icon">🤝</div>
            <div className="card-text">
              <span className="role-label-v2">I need support</span>
              <span className="role-description-v2">Find nearby food banks and local survival resources.</span>
            </div>
            <div className="card-arrow">→</div>
          </a>

          <a className="role-card-v2 volunteer-v2" href="/volunteer">
            <div className="card-icon">🧡</div>
            <div className="card-text">
              <span className="role-label-v2">I am a volunteer</span>
              <span className="role-description-v2">View real-time needs and help out local food banks.</span>
            </div>
            <div className="card-arrow">→</div>
          </a>
        </div>
      </section>
    </main>
  );
}

function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  
  // 增加一个状态来控制志愿者过渡页的显示
  const [showVolunteerIntro, setShowVolunteerIntro] = useState(true);

  if (path === '/recipient') {
    return <FoodbankPage role="recipient" />;
  }

  if (path === '/volunteer') {
    // 如果是第一次进入志愿者路径，显示感人页面
    if (showVolunteerIntro) {
      // 在 App.jsx 找到志愿者过渡页的 return 部分
return (
  <main className="intro-page volunteer-theme">
    {/* ✅ 新加的图片背景层 */}
    <div className="intro-map-overlay">
      <img src="/volunteer-bg.png" alt="Warm Volunteer Scene" className="intro-bg-image" />
    </div>

    {/* 原有的卡片内容保持不变 */}
    <div className="intro-content">
      <div className="heart-icon">🧡</div>
      <h1>Today, there are <span className="count-badge">12</span> aid stations in need of material assistance</h1>
      <p className="intro-text">
        Thank you for your help, your warmth will continue from here.
      </p>
      <button className="start-button" onClick={() => setShowVolunteerIntro(false)}>
        Start My Charitable Action →
      </button>
    </div>
  </main>
);
    }
    return <FoodbankPage role="volunteer" />;
  }

  return <HomePage />;
}

export default App;
