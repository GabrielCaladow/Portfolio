// Lê o feed público (RSS) do canal no YouTube, baixa as capas dos vídeos mais recentes
// para dentro do site e escreve assets/data/videos.json. Roda na GitHub Action diária.
// Sem dependências: só o Node (fetch e fs já vêm nele).
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const MAX_VIDEOS = 3;
const DATA_FILE = "assets/data/videos.json";
const THUMB_DIR = "assets/img/videos";
const VIDEO_ID = /^[\w-]{11}$/;
const CHANNEL = /^UC[\w-]{22}$/;

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" };
const decode = (text) => text.replace(/&(amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity]);

const tag = (xml, name) => xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]?.trim();

function parseFeed(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map(([, entry]) => ({
      id: tag(entry, "yt:videoId"),
      title: decode(tag(entry, "title") ?? ""),
      date: (tag(entry, "published") ?? "").slice(0, 10),
    }))
    .filter((video) => VIDEO_ID.test(video.id) && video.title && /^\d{4}-\d{2}-\d{2}$/.test(video.date))
    .slice(0, MAX_VIDEOS);
}

async function downloadThumbnail(id) {
  const response = await fetch(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
  if (!response.ok) throw new Error(`capa de ${id}: ${response.status}`);
  await writeFile(`${THUMB_DIR}/${id}.jpg`, Buffer.from(await response.arrayBuffer()));
}

async function main() {
  if (!CHANNEL.test(CHANNEL_ID ?? "")) {
    console.log("YOUTUBE_CHANNEL_ID não configurado ou inválido; nada a fazer.");
    return;
  }

  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
  if (!response.ok) throw new Error(`feed do YouTube: ${response.status}`);
  const videos = parseFeed(await response.text());

  await mkdir(THUMB_DIR, { recursive: true });
  for (const video of videos) await downloadThumbnail(video.id);

  // Apaga capas de vídeos que saíram da lista, para o repositório não crescer à toa.
  const keep = new Set(videos.map((video) => `${video.id}.jpg`));
  for (const file of await readdir(THUMB_DIR)) {
    if (!keep.has(file)) await rm(`${THUMB_DIR}/${file}`);
  }

  await writeFile(DATA_FILE, `${JSON.stringify(videos, null, 2)}\n`);
  console.log(`${videos.length} vídeo(s) salvos em ${DATA_FILE}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
