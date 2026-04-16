import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MapDisplay from './components/MapDisplay';
import './App.css';

function App() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    axios.get('/foodbanks-latest.json')
      .then(res => {
        setAllData(res.data.filter(b => b.lat_lng));
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const categories = useMemo(() => {
    const list = allData.map(b => b.network || '独立机构');
    return ['All', ...new Set(list)];
  }, [allData]);

  const filteredData = useMemo(() => {
    return selectedCategory === 'All' 
      ? allData 
      : allData.filter(b => (b.network || '独立机构') === selectedCategory);
  }, [allData, selectedCategory]);

  if (loading) return <div className="loading">📡 加载中...</div>;

  return (
    <div className="app-container">
      <Sidebar 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        count={filteredData.length}
      />
      <MapDisplay data={filteredData} />
    </div>
  );
}

export default App;