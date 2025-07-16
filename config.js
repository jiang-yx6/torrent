import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export default CONFIG;