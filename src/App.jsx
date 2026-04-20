import { useState, useEffect, useMemo } from 'react';
// 将 axios 替换为 papaparse
import Papa from 'papaparse'; 
import Sidebar from './components/Sidebar';
import MapDisplay from './components/MapDisplay';
import './App.css';

// 文本清洗函数：基于关键词进行归类
function cleanCategory(rawText) {
  if (!rawText) return "常规基础援助";
  
  // 全部转为小写，方便统一匹配
  const text = rawText.toLowerCase();

  // 按优先级进行关键词匹配（你可以根据实际情况调整关键词）
  if (text.includes('child') || text.includes('youth') || text.includes('young') || text.includes('school')) {
    return "儿童与青少年";
  }
  if (text.includes('homeless') || text.includes('housing') || text.includes('rough sleep')) {
    return "无家可归者救助";
  }
  if (text.includes('health') || text.includes('disab') || text.includes('mental') || text.includes('illness')) {
    return "医疗与残障支持";
  }
  if (text.includes('elderly') || text.includes('age') || text.includes('older')) {
    return "老年人援助";
  }
  if (text.includes('christian') || text.includes('church') || text.includes('faith') || text.includes('religion')) {
    return "宗教信仰组织";
  }
  if (text.includes('poverty') || text.includes('hardship') || text.includes('relief')) {
    return "综合贫困救助";
  }

  // 如果上面所有的关键词都没命中
  return "其他/常规援助";
}

function App() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // 使用 PapaParse 读取 public 文件夹下的 CSV 文件
    Papa.parse('/foodbanks.csv', {
      download: true,       // 告诉它这是一个需要下载的文件
      header: true,         // 自动把第一行作为 JSON 的属性名（也就是能读出 charity_purpose）
      skipEmptyLines: true, // 跳过空行
      complete: (results) => {
        // 过滤掉没有经纬度的数据
        // const validData = results.data.filter(b => b.lat_lng);
        const validAndCleanData = results.data
          .filter(b => b.lat_lng)
          .map(bank => {
            return {
              ...bank, // 保留其他所有数据
              // 强制覆盖 charity_purpose 为清洗后的精简类别
              charity_purpose: cleanCategory(bank.charity_purpose) 
            };
          });
        setAllData(validAndCleanData);
        setLoading(false);
      },
      error: (error) => {
        console.error("解析 CSV 出错:", error);
        setLoading(false);
      }
    });
  }, []);

  // 修改分类提取逻辑：现在使用 charity_purpose
  const categories = useMemo(() => {
    // 很多慈善目的可能是一长串话，如果你只想要前几个字，或者某些关键词，可以在这里处理
    // 比如有的为空，我们就标为 "常规食物援助"
    const list = allData.map(b => b.charity_purpose || '常规食物援助');
    
    // 如果分类太多了会导致左侧塞不下，你可以限制只显示前 15 种最常见的，或者做模糊匹配
    return ['All', ...new Set(list)];
  }, [allData]);

  const filteredData = useMemo(() => {
    return selectedCategory === 'All' 
      ? allData 
      : allData.filter(b => (b.charity_purpose || '常规食物援助') === selectedCategory);
  }, [allData, selectedCategory]);

  if (loading) return <div className="loading">📡 解析 CSV 数据中...</div>;

  // 获取今天的日期作为模拟的最后更新时间
  // 1. 创建当前时间，然后把天数减 1（变成昨天）
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // 2. 格式化为极简的英国时间
    const lastUpdated = yesterday.toLocaleString('en-GB', {
      timeZone: 'Europe/London', // 强制锁定英国时区
      day: 'numeric',            // 如: 19
      month: 'short',            // 如: Apr (英文简写，显得高级)
      hour: '2-digit',           // 如: 14
      minute: '2-digit',         // 如: 30
      hour12: false              // 24小时制
    });

  return (
    <div className="app-container">
      <Sidebar 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        count={filteredData.length}
        lastUpdated={lastUpdated} // 👈 把时间传给 Sidebar
      />
      <MapDisplay data={filteredData} />
    </div>
  );
}

export default App;