import fs from 'fs';
import axios from 'axios';

async function fetchAndSaveData() {
  console.log("开始获取 GiveFood API 数据...");
  try {
    const response = await axios.get('https://www.givefood.org.uk/api/2/foodbanks/');
    
    // 将获取到的数据直接存入 public 文件夹中
    // 放在 public 文件夹里的文件，React 网页可以直接访问
    fs.writeFileSync('./public/foodbanks-latest.json', JSON.stringify(response.data, null, 2));
    
    console.log(`✅ 数据更新成功！共保存了 ${response.data.length} 条记录。`);
  } catch (error) {
    console.error("❌ 获取数据失败:", error.message);
    process.exit(1); // 如果报错，告诉系统任务失败
  }
}

fetchAndSaveData();