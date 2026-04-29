# 智绘科学：基于国产大模型驱动的数字化实验记录系统

本系统是一款为小学科学课《点亮小灯泡》设计的智能实验记录单工具。系统集成了学生绘图记录、国产大模型 AI 助教、教师可视化管理后台等功能。

## 🌟 核心功能

* **学生端 (`experiment.html`)**：
    * **仿真实验绘图**：支持电池、灯泡元件的拖拽、旋转与导线绘制。
    * **“正正老师” AI 助教**：接入 DeepSeek 大模型，实时解答学生在实验中的科学疑问。
    * **班级汇总互评**：学生可查看全班作品并进行“点赞”互动。
* **教师端 (`admin.html`)**：
    * **可视化审阅**：支持一行 4 份报告单的高效预览与动态缩放。
    * **实时点评**：教师可对学生作品在线撰写评语并即时回传。
* **服务端 (`server.js`)**：
    * 基于 Node.js Express 框架，实现数据持久化存储与 DeepSeek API 转发。

## 🚀 快速开始

### 1. 环境准备
确保您的电脑已安装 [Node.js](https://nodejs.org/)。

### 2. 获取代码并安装依赖
将仓库代码克隆或下载到本地，在项目根目录下打开终端，执行：
```bash
npm install express cors
```

### 3. 配置 DeepSeek API Key (关键步骤) 🔑
为了使“正正老师”智慧问答功能正常工作，您需要配置自己的 API Key：
1. 打开 `server.js` 文件。
2. 找到配置 API Key 的代码部分（大约在第 138 行附近）：
   ```javascript
   const API_KEY = 'sk-xxxxxxxxxxxx'; // 替换为您的 DeepSeek API Key
   ```
3. 将 `'sk-xxxxxxxxxxxx'` 替换为您在 [DeepSeek 开放平台](https://platform.deepseek.com/) 申请的真实密钥。
4. **只要修改此 Key 后，智慧问答系统即可完全正常使用。**

### 4. 启动系统
在终端输入：
```bash
node server.js
```
启动成功后，您可以通过浏览器访问以下地址：
* **学生端**：`http://localhost:3000/experiment.html`
* **教师端**：`http://localhost:3000/admin.html`

## 📁 目录结构
* `experiment.html`: 学生实验绘图与 AI 问答终端。
* `admin.html`: 教师可视化评价与数据管理后台。
* `server.js`: 后端服务程序及大模型接口配置。
* `public/`: 存放实验元件图片 (如 `battery1.png`, `bulb1.png` 等)。
* `data/`: 存放自动生成的实验记录 JSON 文件。

