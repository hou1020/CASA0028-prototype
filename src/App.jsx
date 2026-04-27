import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse'; 
import Sidebar from './components/Sidebar';
import MapDisplay from './components/MapDisplay';
import './App.css';

// Keep all public asset and route links compatible with the GitHub Pages base path.
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const withBase = (path) => `${basePath}${path}`;
const routePath = (pathname) => {
  const withoutBase = basePath && pathname.startsWith(basePath)
    ? pathname.slice(basePath.length)
    : pathname;
  return withoutBase.replace(/\/$/, '') || '/';
};

// Normalise free-text charity purpose fields into stable service categories.
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

// Extract broad material-need tags from the free-text needed_items field.
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

// Treat recently updated needs as urgent so the map can emphasise active requests.
function checkUrgency(timestamp) {
  if (!timestamp) return false;
  const lastFound = new Date(timestamp);
  const now = new Date();
  const diffDays = (now - lastFound) / (1000 * 60 * 60 * 24);
  return diffDays <= 14; 
}

// Calculate straight-line distance in miles from the user's location to a food bank.
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

// Shared map page used by both recipient and volunteer routes.
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

  // Load and enrich the CSV dataset before rendering filters or map points.
  useEffect(() => {
    Papa.parse(withBase('/foodbanks.csv'), {
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

  // Ask the browser for the user's location so the distance filter can work.
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

  // Build the category list from processed data so it matches the available map points.
  const categories = useMemo(() => {
    const list = allData.map(b => b.charity_purpose);
    return ['All', ...new Set(list)];
  }, [allData]);

  // Combine category, need, distance, and role-specific filters into the visible dataset.
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      // Match the selected service category.
      const matchCategory = selectedCategory === 'All' || item.charity_purpose === selectedCategory;
      
      // Require all selected need tags when the user has chosen any.
      const matchNeeds = selectedNeeds.length === 0 || 
                         selectedNeeds.every(tag => item.needsTags[tag]);

      // Keep locations inside the selected distance radius.
      const distanceMiles = getDistanceMiles(userLocation, item.lat_lng);
      const matchDistance = selectedDistance === 'all' ||
                            (distanceMiles !== null && distanceMiles <= Number(selectedDistance));

      // Volunteer view only shows locations with at least one specific material need.
      const hasAnySpecificNeed = Object.values(item.needsTags || {}).some(val => val === true);
      const roleFilter = role === 'volunteer' ? hasAnySpecificNeed : true;

      return matchCategory && matchNeeds && matchDistance && roleFilter;
    });
  }, [allData, selectedCategory, selectedNeeds, selectedDistance, userLocation, role]);
  
  if (loading) return <div className="loading">Building the city support network...</div>;

  const switchTarget = role === 'recipient' ? withBase('/volunteer') : withBase('/recipient');
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

// Landing page where users choose the recipient or volunteer journey.
function HomePage() {
  return (
    <main className="home-page-v2">
      {/* Decorative public illustration shown behind the landing content. */}
      <div className="map-overlay-v3">
  <img src={withBase('/foodbankhelp.png')} alt="Foodbank Help Illustration" className="map-image" />
</div>
      
      <section className="home-content">
        <header className="hero-section">
          <p className="home-kicker">Welcome to City Hearth</p>
          {/* Manual line break keeps the long title readable on the hero screen. */}
          <h1 className="home-title-v2">Pulse of Kindness:<br />Food Security Navigator</h1>
          <p className="home-subtitle">
            Connecting those in need with the warmth of the community. 
            Choose your journey to start making a difference or finding support.
          </p>
        </header>

        <div className="role-container-v2">
          {/* Role cards link into the two dedicated app routes. */}
          <a className="role-card-v2 recipient-v2" href={withBase('/recipient')}>
            <div className="card-icon">🤝</div>
            <div className="card-text">
              <span className="role-label-v2">I need support</span>
              <span className="role-description-v2">Find nearby food banks and local survival resources.</span>
            </div>
            <div className="card-arrow">→</div>
          </a>

          <a className="role-card-v2 volunteer-v2" href={withBase('/volunteer')}>
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
  const path = routePath(window.location.pathname);
  
  // Keep the volunteer intro visible until the user starts the volunteer journey.
  const [showVolunteerIntro, setShowVolunteerIntro] = useState(true);

  if (path === '/recipient') {
    return <FoodbankPage role="recipient" />;
  }

  if (path === '/volunteer') {
    // Show a short intro before loading the volunteer map page.
    if (showVolunteerIntro) {
return (
  <main className="intro-page volunteer-theme">
    {/* Background image layer for the volunteer intro screen. */}
    <div className="intro-map-overlay">
      <img src={withBase('/volunteer-bg.png')} alt="Warm Volunteer Scene" className="intro-bg-image" />
    </div>

    {/* Intro content stays above the background image layer. */}
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
