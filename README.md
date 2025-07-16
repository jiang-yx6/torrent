# 🚀 种子流媒体 API

基于 RESTful 架构的种子文件管理和流媒体服务 API。

## ✨ 特性

- 📥 启动并管理种子下载
- 🎬 直接播放种子中的视频内容
- 📊 实时监控下载状态和进度
- 🎯 简洁直观的管理接口

## 📚 API 文档

### 🔄 种子管理

#### 开始下载
```http
POST /api/torrents/:id/start
```
启动指定种子的下载任务。

#### 删除种子
```http
DELETE /api/torrents/:id
```
停止下载并从系统中移除指定的种子。

### 📊 状态监控

#### 获取所有种子状态
```http
GET /api/status
```
获取所有活动种子的状态信息。

#### 获取单个种子状态
```http
GET /api/status/:id
```
获取指定种子的详细状态。

### 🎬 流媒体

#### 视频流
```http
GET /api/stream/:id
```
从指定种子中获取视频流。

## 🛠️ 安装说明

```bash
# 克隆仓库
git clone [仓库地址]

# 安装依赖
npm install

# 启动服务器
npm start
```

## ⚙️ 环境配置

在项目根目录创建 `.env` 文件，添加以下配置：

```env
PORT=3000            # 服务器端口
DOWNLOAD_PATH=./downloads    # 下载目录
```

## 📝 开源协议

MIT 开源协议 - 欢迎自由使用和修改