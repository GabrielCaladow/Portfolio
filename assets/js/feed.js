const MONTHS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LINKEDIN = "https://www.linkedin.com/";
const MAX_POSTS = 3;
const POST_IMAGE = /^assets\/img\/posts\/[\w-]+\.(webp|jpe?g|png)$/;
const AUTHOR = {
  name: "Gabriel Calado",
  headline: "Estudante de Ciência da Computação · CESAR School",
  avatar: "assets/img/avatar.webp",
};
const relativeTime = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

// Os JSON são escritos pelas automações do segundo cérebro, então tudo é conferido
// antes de aparecer, e o texto entra sempre com textContent, nunca como HTML.
const isText = (value) => typeof value === "string" && value.trim() !== "";

const isValidPost = (post) =>
  ISO_DATE.test(post?.date) &&
  isText(post.text) &&
  isText(post.url) &&
  post.url.startsWith(LINKEDIN) &&
  (post.image === undefined || POST_IMAGE.test(post.image));

const isValidVideo = (video) =>
  /^[\w-]{11}$/.test(video?.id) && isText(video.title) && ISO_DATE.test(video.date);

const isValidEvent = (event) =>
  ISO_DATE.test(event?.date) &&
  isText(event.name) &&
  isText(event.city) &&
  (event.place === undefined || isText(event.place));

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function dateBadge(isoDate) {
  const badge = element("time", "date-badge");
  badge.dateTime = isoDate;
  badge.append(
    element("span", "date-day", isoDate.slice(8, 10)),
    element("span", "date-month", MONTHS[Number(isoDate.slice(5, 7)) - 1]),
  );
  return badge;
}

// "há 2 dias", "semana passada", "há 2 meses", como no LinkedIn.
function timeAgo(isoDate) {
  const days = Math.round((new Date(`${isoDate}T12:00:00`) - Date.now()) / 86_400_000);
  if (days > -7) return relativeTime.format(days, "day");
  if (days > -30) return relativeTime.format(Math.round(days / 7), "week");
  return relativeTime.format(Math.round(days / 30), "month");
}

function icon(name, className) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `assets/icons/sprite.svg#${name}`);
  svg.append(use);
  return svg;
}

function renderPost(post) {
  const item = element("li");
  const card = element("a", "post-card");
  card.href = post.url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  const avatar = element("img", "post-avatar");
  avatar.src = AUTHOR.avatar;
  avatar.alt = "";
  avatar.width = 40;
  avatar.height = 40;

  const time = element("time", "post-meta", timeAgo(post.date));
  time.dateTime = post.date;

  const who = element("div", "post-who");
  who.append(element("strong", "post-author", AUTHOR.name), element("span", "post-headline", AUTHOR.headline), time);

  const header = element("div", "post-header");
  header.append(avatar, who, icon("linkedin", "post-brand"));

  card.append(header, element("p", "post-text", post.text));

  if (post.image) {
    const image = element("img", "post-image");
    image.src = post.image;
    image.alt = "";
    image.loading = "lazy";
    card.append(image);
  }

  card.append(element("span", "post-more", "Ver post completo no LinkedIn"));
  item.append(card);
  return item;
}

// A capa vem do próprio site (baixada pela GitHub Action), não do YouTube: a CSP continua fechada.
function renderVideo(video) {
  const item = element("li");
  const card = element("a", "video-card");
  card.href = `https://www.youtube.com/watch?v=${video.id}`;
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  const cover = element("div", "video-cover");
  const thumbnail = element("img", "video-thumbnail");
  thumbnail.src = `assets/img/videos/${video.id}.jpg`;
  thumbnail.alt = "";
  thumbnail.loading = "lazy";
  cover.append(thumbnail, icon("youtube", "video-play"));

  const time = element("time", "post-meta", timeAgo(video.date));
  time.dateTime = video.date;

  card.append(cover, element("h4", "video-title", video.title), time);
  item.append(card);
  return item;
}

function renderEvent(event) {
  const item = element("li", "feed-card");
  const where = event.place ? `${event.city} · ${event.place}` : event.city;

  const body = element("div", "feed-body");
  body.append(element("h3", "feed-title", event.name), element("p", "feed-text", where));
  item.append(dateBadge(event.date), body);
  return item;
}

async function fillFeed({ name, url, isValid, render, order }) {
  const list = document.querySelector(`[data-feed="${name}"]`);
  if (!list) return;
  const fallback = document.querySelector(`[data-feed-empty="${name}"]`);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    const data = await response.json();
    const items = Array.isArray(data) ? order(data.filter(isValid)) : [];

    if (items.length === 0) {
      fallback.hidden = false;
      return;
    }
    list.append(...items.map(render));
  } catch {
    fallback.hidden = false;
  }
}

export function initFeeds() {
  fillFeed({
    name: "posts",
    url: "assets/data/posts.json",
    isValid: isValidPost,
    render: renderPost,
    order: (posts) => posts.sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_POSTS),
  });

  fillFeed({
    name: "videos",
    url: "assets/data/videos.json",
    isValid: isValidVideo,
    render: renderVideo,
    order: (videos) => videos.sort((a, b) => b.date.localeCompare(a.date)),
  });

  fillFeed({
    name: "events",
    url: "assets/data/events.json",
    isValid: isValidEvent,
    render: renderEvent,
    order: (events) => events.sort((a, b) => a.date.localeCompare(b.date)),
  });
}
