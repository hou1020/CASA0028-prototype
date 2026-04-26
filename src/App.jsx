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

function FoodbankPage({ role }) {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [selectedNeeds, setSelectedNeeds] = useState([]);

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

  const categories = useMemo(() => {
    const list = allData.map(b => b.charity_purpose);
    return ['All', ...new Set(list)];
  }, [allData]);

  const filteredData = useMemo(() => {
    return allData.filter(item => {
      const matchCategory = selectedCategory === 'All' || item.charity_purpose === selectedCategory;
      const matchNeeds = selectedNeeds.length === 0 || 
                         selectedNeeds.every(tag => item.needsTags[tag]);

      return matchCategory && matchNeeds;
    });
  }, [allData, selectedCategory, selectedNeeds]);

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
      />
      
      <a className="role-switch-button" href={switchTarget}>
        {switchLabel}
      </a>

      <MapDisplay data={filteredData} />
    </div>
  );
}

function HomePage() {
  return (
    <main className="home-page">
      <section className="home-panel" aria-labelledby="home-title">
        <p className="home-kicker">Community Food Support Network</p>
        <h1 id="home-title">Choose your role</h1>
        <p className="home-copy">
          Enter the page that matches your role. Both pages currently share the map and filtering experience, and can be expanded into separate workflows later.
        </p>

        <div className="role-actions" aria-label="Choose your role">
          <a className="role-card recipient" href="/recipient">
            <span className="role-label">I need support</span>
            <span className="role-description">Find nearby food banks and available support.</span>
          </a>
          <a className="role-card volunteer" href="/volunteer">
            <span className="role-label">I am a volunteer</span>
            <span className="role-description">View current needs and places where you can help.</span>
          </a>
        </div>
      </section>
    </main>
  );
}

function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  if (path === '/recipient') {
    return <FoodbankPage role="recipient" />;
  }

  if (path === '/volunteer') {
    return <FoodbankPage role="volunteer" />;
  }

  return <HomePage />;
}

export default App;
