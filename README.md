# Meaow Game Recommender 🐾

这是一个为您服务的猫娘风格 PC/主机游戏推荐网站！

## ✨ 特性 (Features)

- **猫娘问询服务**：可爱的界面风格，以对话形式收集您的游戏偏好。
- **多平台支持**：支持 PC (Steam/Epic), Nintendo Switch, PlayStation。
- **智能推荐**：根据您的标签（如“硬核”、“二次元”）和期待进行筛选。
- **价格与折扣监控**：自动识别特惠游戏，并在您寻找便宜游戏时优先推荐。
- **多维排序**：支持按评分、价格（高/低）、热度 (DAU) 排序。

## 🚀 如何运行 (How to Run)

由于环境限制，您需要手动安装依赖并启动项目：

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **启动开发服务器**:
   ```bash
   npm run dev
   ```

3. **打开浏览器**:
   访问终端显示的地址 (通常是 `http://localhost:5173`)。

## 🛠️ 技术栈

- **React** + **Vite**
- **Tailwind CSS** (用于实现猫娘配色与响应式布局)
- **Lucide React** (图标库)

## 📁 项目结构

- `src/components/CatInputForm.jsx`: 用户输入表单
- `src/components/GameCard.jsx`: 游戏展示卡片
- `src/data/mockGames.js`: 模拟的游戏数据库
- `src/App.jsx`: 主逻辑与布局
