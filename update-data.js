import fs from 'fs';
import axios from 'axios';

async function fetchAndSaveData() {
  console.log("🤖 开始获取 GiveFood 最新 CSV 数据...");
  try {
    // 使用官方提供的固定 latest 链接
    const csvUrl = 'https://www.givefood.org.uk/dumps/foodbanks/csv/latest/'; 
    
    console.log(`正在请求: ${csvUrl}`);
    // responseType: 'text' 确保我们拿到的是未被破坏的纯文本 CSV
    const response = await axios.get(csvUrl, { responseType: 'text' });
    
    // 直接将纯文本写入 public 文件夹，命名为固定的 foodbanks.csv
    fs.writeFileSync('./public/foodbanks.csv', response.data);
    
    console.log(`✅ CSV 数据更新成功！已覆盖保存到 public/foodbanks.csv`);
  } catch (error) {
    console.error("❌ 获取数据失败:", error.message);
    // 通知 GitHub Actions 任务失败，这样你会在 GitHub 收到报错邮件，而不是以为成功了
    process.exit(1); 
  }
}

fetchAndSaveData();