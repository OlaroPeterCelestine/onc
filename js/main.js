const ICONS = {
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a2 2 0 01-2 2A16 16 0 014 5a2 2 0 012-2z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3"/><path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>'
};

function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function setupMenus() {
  const drawer = document.querySelector("[data-drawer]");
  const open = () => {
    drawer.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    drawer.classList.remove("open");
    document.body.style.overflow = "";
  };
  document.querySelectorAll("[data-menu]").forEach((btn) => {
    btn.addEventListener("click", open);
  });
  drawer.querySelector("[data-close]").addEventListener("click", close);
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) close();
  });
  drawer.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
}

function setupHero() {
  const slides = [...document.querySelectorAll(".hero-slide")];
  const dots = [...document.querySelectorAll(".hero-dots button")];
  if (!slides.length) return;
  let i = 0;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("on", idx === i));
    dots.forEach((d, idx) => d.classList.toggle("on", idx === i));
  };
  dots.forEach((d, idx) => d.addEventListener("click", () => show(idx)));
  setInterval(() => show(i + 1), 6000);
}

function setupChairman() {
  const cards = [...document.querySelectorAll("[data-chairman] .story-card")];
  if (cards.length < 2) return;
  let start = 0;
  const page = () => (window.innerWidth <= 680 ? 1 : 2);
  const render = () => {
    const count = page();
    cards.forEach((card, idx) => {
      const visible = idx >= start && idx < start + count;
      card.hidden = !visible;
    });
  };
  document.querySelectorAll("[data-chairman-nav]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = Number(btn.dataset.chairmanNav);
      const count = page();
      start = (start + dir * count + cards.length) % cards.length;
      if (start > cards.length - count) start = 0;
      render();
    });
  });
  window.addEventListener("resize", render);
  render();
}

function setupPdm() {
  const slides = [...document.querySelectorAll(".pdm-slide")];
  if (!slides.length) return;
  let i = 0;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle("on", idx === i));
  };
  document.querySelectorAll("[data-pdm]").forEach((btn) => {
    btn.addEventListener("click", () => show(i + Number(btn.dataset.pdm)));
  });
}

function setupToTop() {
  const btn = document.querySelector("[data-top]");
  if (!btn) return;
  const onScroll = () => btn.classList.toggle("show", window.scrollY > 500);
  window.addEventListener("scroll", onScroll, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setupNotice() {
  const notice = document.querySelector("[data-notice]");
  if (!notice) return;
  if (sessionStorage.getItem("onc-notice") === "1") {
    notice.hidden = true;
    return;
  }
  notice.querySelector("[data-notice-close]").addEventListener("click", () => {
    notice.hidden = true;
    sessionStorage.setItem("onc-notice", "1");
  });
}

function setupForm() {
  const form = document.querySelector("[data-contact]");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const notes = JSON.parse(localStorage.getItem("onc-messages") || "[]");
    notes.push({
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      subject: data.get("subject"),
      message: data.get("message"),
      at: new Date().toISOString()
    });
    localStorage.setItem("onc-messages", JSON.stringify(notes));
    form.reset();
    document.querySelector("[data-success]").classList.add("show");
  });
}

function setupLightbox() {
  const box = document.querySelector("[data-lightbox]");
  if (!box) return;
  const img = box.querySelector("img");
  const cap = box.querySelector("p");
  document.addEventListener("click", (e) => {
    const fig = e.target.closest("[data-photo]");
    if (!fig) return;
    img.src = fig.dataset.photo;
    img.alt = fig.dataset.caption || "";
    cap.textContent = fig.dataset.caption || "";
    box.classList.add("open");
  });
  box.addEventListener("click", (e) => {
    if (e.target === box || e.target.dataset.closeLight != null) box.classList.remove("open");
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function projectProgress(project) {
  const steps = project.milestones || [];
  const done = steps.filter((step) => step.state === "done").length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
  return { done, total: steps.length, pct };
}

function projectWhen(project) {
  if (project.start && project.updated && project.start !== project.updated) {
    return `${fmtDate(project.start)} – ${fmtDate(project.updated)}`;
  }
  if (project.updated) return fmtDate(project.updated);
  if (project.start) return fmtDate(project.start);
  return "Photo record";
}

function milestoneWhen(step) {
  if (step.date) return fmtDate(step.date);
  if (step.state === "current") return "In progress";
  if (step.state === "upcoming") return "Up next";
  return "Recorded";
}

function projectCard(project) {
  const { done, total, pct } = projectProgress(project);
  return `<a class="project-card" href="project.html?slug=${encodeURIComponent(project.slug)}">
      <img src="${escapeHtml(project.cover)}" alt="">
      <div class="body">
        <span class="status status-${escapeHtml(project.status)}">${escapeHtml(project.status)}</span>
        <h3>${escapeHtml(project.title)}</h3>
        <p class="project-where">${escapeHtml(project.location)}</p>
        <div class="meta">${ICONS.cal}<span>${escapeHtml(projectWhen(project))}</span></div>
        <div class="progress" role="img" aria-label="${pct} percent, ${done} of ${total} steps complete"><span style="width:${pct}%"></span></div>
        <p class="progress-label"><b>${pct}%</b> · ${done} of ${total} steps</p>
      </div>
    </a>`;
}

function setupProjects() {
  const root = document.querySelector("[data-projects]");
  const home = document.querySelector("[data-home-projects]");
  const projects = window.ONC_PROJECTS || [];
  if (home) home.innerHTML = projects.slice(0, 3).map(projectCard).join("");
  if (!root) return;
  const filters = document.querySelector("[data-project-filters]");
  const paint = (status) => {
    const list = status && status !== "all" ? projects.filter((project) => project.status === status) : projects;
    root.innerHTML = list.length
      ? list.map(projectCard).join("")
      : "<p class=\"project-empty\">No projects in this group yet.</p>";
  };
  paint("all");
  if (!filters) return;
  filters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    filters.querySelectorAll("button").forEach((item) => item.classList.toggle("on", item === btn));
    paint(btn.dataset.filter);
  });
}

function setupProject() {
  const root = document.querySelector("[data-project]");
  if (!root) return;
  const slug = new URLSearchParams(location.search).get("slug");
  const project = (window.ONC_PROJECTS || []).find((item) => item.slug === slug);
  if (!project) {
    root.innerHTML = "<p>This project could not be found. <a href=\"projects.html\">Back to projects</a></p>";
    return;
  }
  const { done, total, pct } = projectProgress(project);
  const posts = window.ONC_POSTS || [];
  const related = (project.updates || []).map((id) => posts.find((post) => post.slug === id)).filter(Boolean);
  const steps = project.milestones || [];
  document.title = project.title + " · Office of the National Chairman";
  root.innerHTML = `
    <a class="crumb" href="projects.html">PROJECTS</a>
    <div class="project-kicker">
      <span class="status status-${escapeHtml(project.status)}">${escapeHtml(project.status)}</span>
      <span>${escapeHtml(project.location)}</span>
    </div>
    <h1>${escapeHtml(project.title)}</h1>
    <p class="project-summary">${escapeHtml(project.summary)}</p>
    <div class="project-stats">
      <div><small>Started</small><b>${project.start ? fmtDate(project.start) : "See record"}</b></div>
      <div><small>Latest date</small><b>${project.updated ? fmtDate(project.updated) : "See record"}</b></div>
      <div><small>Lead</small><b>${escapeHtml(project.lead)}</b></div>
      <div><small>Steps done</small><b>${done} of ${total}</b></div>
    </div>
    <section class="project-progress-block">
      <div class="project-progress-head">
        <h2>Progress</h2>
        <strong>${pct}%</strong>
      </div>
      <div class="progress progress-lg" role="img" aria-label="${pct} percent complete"><span style="width:${pct}%"></span></div>
      <p class="progress-note">${done} completed, ${steps.filter((step) => step.state === "current").length} in progress, ${steps.filter((step) => step.state === "upcoming").length} still ahead.</p>
      <ol class="milestones">
        ${steps.map((step) => `<li class="is-${escapeHtml(step.state)}">
          <time>${escapeHtml(milestoneWhen(step))}</time>
          <div>
            <h3>${escapeHtml(step.title)}</h3>
            <p>${escapeHtml(step.detail)}</p>
          </div>
        </li>`).join("")}
      </ol>
    </section>
    <section class="project-copy">
      <h2>About this project</h2>
      ${(project.about || []).map((para) => `<p>${escapeHtml(para)}</p>`).join("")}
    </section>
    <section class="project-gallery">
      <h2>Gallery</h2>
      <div class="gallery-grid">
        ${(project.gallery || []).map((photo) => `<figure data-photo="${escapeHtml(photo.src)}" data-caption="${escapeHtml(photo.caption)}">
          <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.caption)}">
          <figcaption>${escapeHtml(photo.caption)}</figcaption>
        </figure>`).join("")}
      </div>
    </section>
    ${related.length ? `<section class="project-related">
      <h2>Related updates</h2>
      <div class="related-list">
        ${related.map((post) => `<a href="article.html?slug=${encodeURIComponent(post.slug)}">
          <img src="${escapeHtml(post.image)}" alt="">
          <span><small>${fmtDate(post.date)}</small>${escapeHtml(post.title)}</span>
        </a>`).join("")}
      </div>
    </section>` : ""}`;
}

async function loadPosts() {
  if (window.ONC_POSTS) return window.ONC_POSTS;
  const res = await fetch("data/posts.json");
  if (!res.ok) throw new Error("posts");
  return res.json();
}

async function setupListing() {
  const root = document.querySelector("[data-list]");
  if (!root) return;
  const section = root.dataset.list;
  const posts = (await loadPosts()).filter((p) => p.section === section);
  root.innerHTML = posts.map((p) => `
    <a class="news-card" href="article.html?slug=${encodeURIComponent(p.slug)}">
      <img src="${p.image}" alt="">
      <div class="body">
        <span class="tag">${section === "chairman" ? "CHAIRMAN'S CORNER" : section === "courtesy" ? "COURTESY VISIT" : "NEWS"}</span>
        <div class="meta">${ICONS.cal}<span>${fmtDate(p.date)}</span></div>
        <h3>${p.title}</h3>
      </div>
    </a>`).join("");
}

async function setupArticle() {
  const root = document.querySelector("[data-article]");
  if (!root) return;
  const slug = new URLSearchParams(location.search).get("slug");
  const posts = await loadPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    root.innerHTML = "<p>This update could not be found. <a href='news.html'>Back to news</a></p>";
    return;
  }
  const back = post.section === "chairman" ? "chairman.html" : post.section === "courtesy" ? "courtesy.html" : "news.html";
  const label = post.section === "chairman" ? "Chairman's Corner" : post.section === "courtesy" ? "Courtesy Visits" : "News Updates";
  document.title = post.title + " · Office of the National Chairman";
  root.innerHTML = `
    <a class="crumb" href="${back}">${label.toUpperCase()}</a>
    <h1>${post.title}</h1>
    <div class="meta">${ICONS.cal}<span>${fmtDate(post.date)}</span></div>
    <img class="hero-img" src="${post.image}" alt="">
    ${(post.paragraphs || [post.excerpt]).map((para) => `<p>${para}</p>`).join("")}
    <p><a class="learn" href="${back}">← Back to ${label}</a></p>`;
}

document.addEventListener("DOMContentLoaded", () => {
  setupMenus();
  setupHero();
  setupChairman();
  setupPdm();
  setupToTop();
  setupNotice();
  setupForm();
  setupLightbox();
  setupProjects();
  setupProject();
  setupListing().catch(() => {
    const root = document.querySelector("[data-list]");
    if (root) root.innerHTML = "<p>Stories could not be loaded. Open this site through a local server.</p>";
  });
  setupArticle().catch(() => {
    const root = document.querySelector("[data-article]");
    if (root) root.innerHTML = "<p>This story could not be loaded.</p>";
  });
});
