import WebTorrent from 'webtorrent';
import CONFIG from './config.js';

export default class TorrentManager{
    constructor(){
        this.client = new WebTorrent();
        this.activeTorrents = new Map();

    }

    getTorrentStatus(torrentId){
        const torrent = this.activeTorrents.get(torrentId);
        if(!torrent){
            console.log(`种子 ${torrentId} 不存在, 无法获取该状态`)
            return null;
        }
        return {
            id: torrentId,
            infoHash: torrent.infoHash,
            name: torrent.name,
            progress: (torrent.progress * 100).toFixed(1),
            peers: torrent.numPeers,
            downloadSpeed: (torrent.downloadSpeed / (1024 * 1024)).toFixed(2),
            timeRemaining: Math.floor(torrent.timeRemaining / 1000),
            files: torrent.files.map(file => ({
              name: file.name,
              length: file.length,
              progress: (file.progress * 100).toFixed(1)
            }))
        }
    }
    
    getAllTorrentsStatus() {
        const statuses= []
        for(const [id,torrent] of this.activeTorrents){
            statuses.push(this.getTorrentStatus(id))
        }
        return statuses
    }



  // 添加新的种子
    async addTorrent(id, magnetUri) {
        return new Promise((resolve, reject) => {
        if (this.activeTorrents.has(id)) {
            return resolve(this.activeTorrents.get(id));
        }

        const torrent = this.client.add(magnetUri, { path: CONFIG.downloadPath });
        
        torrent.on('error', (error) => {
            console.error(`种子 ${id} 下载错误:`, error);
            this.activeTorrents.delete(id);
            reject(error);
        });

        torrent.on('ready', () => {
            console.log(`种子 ${id} 准备就绪:`, torrent.infoHash);
            this.activeTorrents.set(id, torrent);
            resolve(torrent);
        });

        torrent.on('download', () => {
            const progressPercent = Math.floor(torrent.progress * 100);
            if (progressPercent % 5 === 0 && progressPercent !== torrent.lastLoggedProgress) {
                console.log(`种子 ${id} 下载进度:`, progressPercent + '%');
                torrent.lastLoggedProgress = progressPercent;
            }
        });

        torrent.on('done', () => {
            console.log(`种子 ${id} 下载完成! 总大小:`, (torrent.length / 1024 / 1024).toFixed(2) + 'MB');
        });
        });
    }

    // 移除种子
    removeTorrent(id) {
        const torrent = this.activeTorrents.get(id);
        if (torrent) {
            torrent.destroy();
            this.activeTorrents.delete(id);
        return true;
        }
        return false;
    }

    // 获取视频文件
    getVideoFile(torrentId) {
        const torrent = this.activeTorrents.get(torrentId);
        if (!torrent) return null;
        
        return torrent.files.find(file => {
        const ext = file.name.toLowerCase();
        return ext.endsWith('.mp4') || ext.endsWith('.mkv') || 
                ext.endsWith('.webm') || ext.endsWith('.avi');
        });
    }
}