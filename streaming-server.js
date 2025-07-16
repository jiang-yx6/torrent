import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors'; // 需要安装：npm install cors
import CONFIG from './config.js';
import TorrentManager from './TorrentManager.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const torrentManager = new TorrentManager();

// 启用 CORS
app.use(cors());

// 确保下载目录存在
if (!fs.existsSync(CONFIG.downloadPath)) {
  fs.mkdirSync(CONFIG.downloadPath, { recursive: true });
}

//获取可下载的种子列表
app.route("/api/torrent_list").get((req,res)=>{
  try{
    const torrents_list = fs.readFileSync(path.join(__dirname,'spider/results.json'),'utf-8')
    const data = JSON.parse(torrents_list)
    res.json(data)
  }catch(error){
    console.error('读取种子列表失败:', error);
    res.status(500).json({ error: '读取种子列表失败' });
  }
})

//开始下载种子
app.route("/api/torrents/:id/start").get(async (req,res) => {
  try{
    const {id} = req.params
    const torrents = JSON.parse(fs.readFileSync(path.join(__dirname,"./spider/results.json"),"utf-8"))
    const torrentInfo = torrents.find(torrent => torrent.id === Number(id))
    if(!torrentInfo){
      return res.status(404).json({error:"种子不存在"})
    }
    await torrentManager.addTorrent(id,torrentInfo.url)
    res.json({ success: true, status: torrentManager.getTorrentStatus(Number(id)) });
  }catch(error){
    console.error("下载种子失败:",error)
    res.status(500).json({error:"下载种子失败"})
  }
})

//删除某个种子
app.route("/api/torrents/:id/delete").delete((req,res) =>{
  const {id} = req.params
  const removed = torrentManager.removeTorrent(Number(id))
})


//获取所有种子状态
app.route("/api/status").get((req,res) => {
  const status = torrentManager.getAllTorrentsStatus()
  res.json(status)
})

//查看单个种子状态
app.route("/api/status/:id").get((req,res)=>{
  const {id} = req.params;
  const status = torrentManager.getTorrentStatus(id)
  if(!status){
    return res.status(404).json({error:"种子不存在"})
  }
  res.json(status)
})

//获取视频流
app.get('/api/stream/:id', (req, res) => {
  try {
    const { id } = req.params;
    const file = torrentManager.getVideoFile(id);
    
    if (!file) {
      return res.status(404).json({ error: '未找到视频文件' });
    }

    const range = req.headers.range;
    const fileSize = file.length;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      });

      const stream = file.createReadStream({ start, end });
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: '视频流出错' });
        }
      });

      req.on('close', () => stream.destroy());
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      });
      
      const stream = file.createReadStream();
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: '视频流出错' });
        }
      });

      req.on('close', () => stream.destroy());
      stream.pipe(res);
    }
  } catch (error) {
    res.status(500).json({ error: '处理视频流失败: ' + error.message });
  }
});

// 启动服务器
app.listen(CONFIG.port, () => {
  console.log(`API 服务器运行在 http://localhost:${CONFIG.port}`);
}); 