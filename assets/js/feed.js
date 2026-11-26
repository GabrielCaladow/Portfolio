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

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const optionalText = (value) => value === undefined || isText(value);

const isValidEvent = (event) =>
  ISO_DATE.test(event?.date) &&
  (event.endDate === undefined || (ISO_DATE.test(event.endDate) && event.endDate >= event.date)) &&
  isText(event.name) &&
  isText(event.city) &&
  optionalText(event.place) &&
  optionalText(event.tagline) &&
  (event.url === undefined || (isText(event.url) && event.url.startsWith("https://"))) &&
  (event.colors === undefined || (HEX_COLOR.test(event.colors.from) && HEX_COLOR.test(event.colors.to)));

// Data de hoje no formato do JSON (AAAA-MM-DD), no fuso de quem está vendo o site.
const today = () => new Date().toLocaleDateString("sv-SE");
const isPast = (event) => (event.endDate ?? event.date) < today();

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
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

// "12" ou "11–14" e o mês. Se o evento atravessar o mês, o mês vira "NOV–DEZ".
function eventDays(event) {
  const end = event.endDate ?? event.date;
  const startMonth = MONTHS[Number(event.date.slice(5, 7)) - 1];
  const endMonth = MONTHS[Number(end.slice(5, 7)) - 1];
  const days = end === event.date ? event.date.slice(8, 10) : `${event.date.slice(8, 10)}–${end.slice(8, 10)}`;
  return { days, month: startMonth === endMonth ? startMonth : `${startMonth}–${endMonth}` };
}

// Ingresso: a faixa com as cores do evento e a data, e as informações ao lado.
// Evento que já passou vira ingresso usado (desbotado e carimbado); o próximo fica aceso.
function renderEvent(event) {
  const past = isPast(event);
  const item = element("li", `ticket ${past ? "is-past" : "is-upcoming"}`);
  if (event.colors) {
    item.style.setProperty("--ev-from", event.colors.from);
    item.style.setProperty("--ev-to", event.colors.to);
  }

  const { days, month } = eventDays(event);
  const stub = element("time", "ticket-stub");
  stub.dateTime = event.date;
  stub.append(
    element("span", "ticket-days", days),
    element("span", "ticket-month", month),
    element("span", "ticket-year", event.date.slice(0, 4)),
  );
  if (past) stub.append(icon("check", "ticket-stamp"));

  const info = element("div", "ticket-info");
  info.append(
    element("span", "visually-hidden", past ? "Evento que já aconteceu:" : "Próximo evento:"),
    element("h3", "ticket-name", event.name),
  );
  if (event.tagline) info.append(element("p", "ticket-tagline", event.tagline));
  info.append(element("p", "ticket-where", event.place ? `${event.city} · ${event.place}` : event.city));

  if (event.url) {
    const link = element("a", "ticket-link", `${new URL(event.url).hostname.replace(/^www\./, "")} ↗`);
    link.href = event.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    info.append(link);
  }

  item.append(stub, info);
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
    // Os próximos primeiro (do mais perto ao mais longe), depois os que já passaram (do mais recente).
    order: (events) => [
      ...events.filter((event) => !isPast(event)).sort((a, b) => a.date.localeCompare(b.date)),
      ...events.filter(isPast).sort((a, b) => b.date.localeCompare(a.date)),
    ],
  });
}
