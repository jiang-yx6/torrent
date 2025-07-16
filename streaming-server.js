import WebTorrent from 'webtorrent';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors'; // 需要安装：npm install cors

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const client = new WebTorrent();

// 启用 CORS
app.use(cors());

// 配置选项
const CONFIG = {
  port: 3001, // 改为 3001，避免与前端端口冲突
  downloadPath: path.join(__dirname, 'downloads'),
  magnetUri: 'magnet:?xt=urn:btih:29b7ce90f36aa95ed99191e0f3e0c814b104b994&tr=http%3a%2f%2ft.nyaatracker.com%2fannounce&tr=http%3a%2f%2ftracker.kamigami.org%3a2710%2fannounce&tr=http%3a%2f%2fshare.camoe.cn%3a8080%2fannounce&tr=http%3a%2f%2fopentracker.acgnx.se%2fannounce&tr=http%3a%2f%2fanidex.moe%3a6969%2fannounce&tr=http%3a%2f%2ft.acg.rip%3a6699%2fannounce&tr=https%3a%2f%2ftr.bangumi.moe%3a9696%2fannounce&tr=udp%3a%2f%2ftr.bangumi.moe%3a6969%2fannounce&tr=http%3a%2f%2fopen.acgtracker.com%3a1096%2fannounce&tr=udp%3a%2f%2ftracker.opentrackr.org%3a1337%2fannounce' +
    '&tr=wss://tracker.btorrent.xyz' +
    '&tr=wss://tracker.openwebtorrent.com' +
    '&tr=wss://tracker.fastcast.nz' +
    '&tr=wss://tracker.sloppyta.co' +
    '&tr=wss://tracker.webtorrent.dev' +
    '&tr=wss://tracker.files.fm:7073/announce' +
    '&tr=udp://tracker.opentrackr.org:1337/announce' +
    '&tr=udp://tracker.openbittorrent.com:6969/announce' +
    '&tr=udp://open.stealth.si:80/announce' +
    '&tr=udp://tracker.torrent.eu.org:451/announce' +
    '&tr=udp://explodie.org:6969/announce' +
    '&ws=https://webtorrent.io/torrents/'
};

// 确保下载目录存在
if (!fs.existsSync(CONFIG.downloadPath)) {
  fs.mkdirSync(CONFIG.downloadPath, { recursive: true });
}

// API 路由：获取视频流
app.get('/api/stream', (req, res) => {
  if (!client.torrents.length) {
    return res.status(404).json({ error: '没有正在下载的视频' });
  }

  const torrent = client.torrents[0];
  const file = torrent.files.find(file => {
    return file.name.endsWith('.mp4') || file.name.endsWith('.mkv') || file.name.endsWith('.webm');
  });

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
    res.on('end', () => stream.destroy());

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
    res.on('end', () => stream.destroy());

    stream.pipe(res);
  }
});

// API 路由：获取下载状态
app.get('/api/status', (req, res) => {
  if (!client.torrents.length) {
    return res.json({ progress: 0, peers: 0, downloadSpeed: 0 });
  }

  const torrent = client.torrents[0];
  res.json({
    progress: (torrent.progress * 100).toFixed(1),
    peers: torrent.numPeers,
    downloadSpeed: (torrent.downloadSpeed / (1024 * 1024)).toFixed(2),
    timeRemaining: Math.floor(torrent.timeRemaining / 1000)
  });
});

// 开始下载种子
client.add(CONFIG.magnetUri, torrent => {
  console.log('客户端开始下载:', torrent.infoHash);
  console.log('种子名称:', torrent.name);
  
  torrent.on('done', () => {
    console.log('下载完成！');
    console.log('总大小:', (torrent.length / 1024 / 1024).toFixed(2), 'MB');
  });

  torrent.on('error', (error) => {
    console.error('下载错误:', error);
  });
  torrent.on('metadata', () => {
    console.log('获取元数据...');
  });
  torrent.on('ready', () => {
    console.log('种子准备就绪...');
  });
  torrent.on('warning', (warning) => {
    console.warn('警告:', warning);
  });
});

// 启动服务器
app.listen(CONFIG.port, () => {
  console.log(`API 服务器运行在 http://localhost:${CONFIG.port}`);
}); 