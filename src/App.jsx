import { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse'; 
import Sidebar from './components/Sidebar';
import MapDisplay from './components/MapDisplay';
// 如果你之后建立了 NeedsFilter 组件，记得在这里 import
// import NeedsFilter from './components/NeedsFilter'; 
import './App.css';

/** 1. 之前的人群分类清洗函数（保留） **/
function cleanCategory(rawText) {
  if (!rawText) return "其他/常规援助";
  const text = rawText.toLowerCase();
  if (text.includes('child') || text.includes('youth') || text.includes('young') || text.includes('school')) return "儿童与青少年";
  if (text.includes('homeless') || text.includes('housing') || text.includes('rough sleep')) return "无家可归者救助";
  if (text.includes('health') || text.includes('disab') || text.includes('mental') || text.includes('illness')) return "医疗与残障支持";
  if (text.includes('elderly') || text.includes('age') || text.includes('older')) return "老年人援助";
  if (text.includes('christian') || text.includes('church') || text.includes('faith') || text.includes('religion')) return "宗教信仰组织";
  if (text.includes('poverty') || text.includes('hardship') || text.includes('relief')) return "综合贫困救助";
  return "其他/常规援助";
}

/** 2. 新增：物资需求语义分类函数 **/
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

/** 3. 新增：紧急程度判断函数（基于时间戳） **/
function checkUrgency(timestamp) {
  if (!timestamp) return false;
  const lastFound = new Date(timestamp);
  const now = new Date();
  // 如果是 14 天内更新过需求的，视为“活跃需求/紧急”
  const diffDays = (now - lastFound) / (1000 * 60 * 60 * 24);
  return diffDays <= 14; 
}

function FoodbankPage({ role }) {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // 【新增状态】：存储用户选中的物资标签（数组格式）
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
              // 人群分类清洗
              charity_purpose: cleanCategory(bank.charity_purpose),
              // 物资标签提取
              needsTags: categorizeNeeds(bank.needed_items),
              // 紧急状态判断
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

  // 【核心修改点】：双重联动过滤逻辑
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      // 条件 1: 匹配人群分类
      const matchCategory = selectedCategory === 'All' || item.charity_purpose === selectedCategory;

      // 条件 2: 匹配物资标签（如果用户一个物资都没勾，默认显示全部；如果勾了，则需要全部满足）
      const matchNeeds = selectedNeeds.length === 0 || 
                         selectedNeeds.every(tag => item.needsTags[tag]);

      return matchCategory && matchNeeds;
    });
  }, [allData, selectedCategory, selectedNeeds]);

  if (loading) return <div className="loading">📡 正在构建城市救助网络...</div>;

  const switchTarget = role === 'recipient' ? '/volunteer' : '/recipient';
  const switchLabel = role === 'recipient' ? '切换至志愿者' : '切换至受助者';
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
        totalCount={allData.length}
      />
      
      <a className="role-switch-button" href={switchTarget}>
        {switchLabel}
      </a>

      {/* MapDisplay 里的点现在带有 isUrgent 和 needsTags 属性了 */}
      <MapDisplay data={filteredData} />
    </div>
  );
}

function HomePage() {
  return (
    <main className="home-page">
      <section className="home-panel" aria-labelledby="home-title">
        <p className="home-kicker">Community Food Support Network</p>
        <h1 id="home-title">请选择你的身份</h1>
        <p className="home-copy">
          根据你的身份进入对应页面。当前两个页面先共用现有地图与筛选功能，后续可以再分别扩展不同流程。
        </p>

        <div className="role-actions" aria-label="选择身份">
          <a className="role-card recipient" href="/recipient">
            <span className="role-label">我是受助者</span>
            <span className="role-description">查找附近食物银行与可获得的物资支持</span>
          </a>
          <a className="role-card volunteer" href="/volunteer">
            <span className="role-label">我是志愿者</span>
            <span className="role-description">查看当前需求并了解可以参与支持的地点</span>
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
