(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  if (!window.location.hostname.includes("github.io")) {
    document.querySelectorAll('a[href="./index.html"]').forEach(function (el) {
      el.setAttribute("href", "./website-preview");
    });
  }

  var gateModal = document.getElementById("hr-gate-modal");
  var gateAccept = document.getElementById("hr-gate-accept");
  if (gateModal) {
    if (sessionStorage.getItem("tns_hr_gate_accepted") === "1") {
      gateModal.classList.add("hidden");
    }
    if (gateAccept) {
      gateAccept.addEventListener("click", function () {
        sessionStorage.setItem("tns_hr_gate_accepted", "1");
        gateModal.classList.add("hidden");
      });
    }
  }

  var colorStyles = {
    rose: { border: "border-rose-500/45 hover:border-rose-400", badge: "bg-rose-500/20 text-rose-300 border-rose-400/40", btn: "bg-rose-500 hover:bg-rose-400 text-obsidian" },
    amber: { border: "border-amber-400/45 hover:border-amber-300", badge: "bg-amber-400/20 text-amber-300 border-amber-400/40", btn: "bg-amber-400 hover:bg-amber-300 text-obsidian" },
    sky: { border: "border-sky-400/40 hover:border-sky-300", badge: "bg-sky-400/20 text-sky-300 border-sky-400/40", btn: "bg-sky-400 hover:bg-sky-300 text-obsidian" },
    emerald: { border: "border-emerald-400/40 hover:border-emerald-300", badge: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40", btn: "bg-emerald-400 hover:bg-emerald-300 text-obsidian" }
  };

  function getDiagramSvg(type) {
    if (type === "bevel-anatomy") {
      return '<svg viewBox="0 0 500 150" class="w-full h-36 bg-[#040a14] rounded-2xl border border-emerald-400/30 p-3"><text x="16" y="24" fill="#34d399" font-size="12" font-weight="bold">CORRECT: BEVEL SLANT FACING UP (15°–30° ANGLE)</text><line x1="20" y1="115" x2="480" y2="115" stroke="#0284c7" stroke-width="14" stroke-linecap="round" opacity="0.35"/><text x="370" y="119" fill="#38bdf8" font-size="10" font-weight="bold">VEIN FLOW → HEART</text><polygon points="80,45 250,95 235,103 72,55" fill="#94a3b8"/><polygon points="235,103 272,103 250,95" fill="#34d399"/><circle cx="256" cy="96" r="14" fill="none" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3 2"/><text x="278" y="92" fill="#fbbf24" font-size="11" font-weight="bold">Slanted Opening (Bevel) Up</text><text x="278" y="107" fill="#cbd5e1" font-size="10">Sharpest bottom tip enters smoothly</text></svg>';
    }
    if (type === "naloxone-types") {
      return '<svg viewBox="0 0 500 150" class="w-full h-36 bg-[#040a14] rounded-2xl border border-rose-400/30 p-3"><rect x="18" y="18" width="215" height="114" rx="12" fill="#0f172a" stroke="#f43f5e" stroke-width="1.5"/><text x="32" y="42" fill="#fda4af" font-size="12" font-weight="bold">1. NASAL SPRAY (4mg)</text><text x="32" y="64" fill="#e2e8f0" font-size="10">• Peel blister pack (no assembly)</text><text x="32" y="82" fill="#e2e8f0" font-size="10">• Tip fully into 1 nostril</text><text x="32" y="100" fill="#34d399" font-size="10" font-weight="bold">• Press plunger firmly once</text><rect x="255" y="18" width="225" height="114" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/><text x="270" y="42" fill="#7dd3fc" font-size="12" font-weight="bold">2. IM VIAL PACK (0.4mg/mL)</text><text x="270" y="64" fill="#e2e8f0" font-size="10">• Pop cap &amp; draw 1mL from vial</text><text x="270" y="82" fill="#e2e8f0" font-size="10">• Straight 90° into outer thigh/arm</text><text x="270" y="100" fill="#fbbf24" font-size="10" font-weight="bold">• Repeat in 2–3m + Rescue Breaths</text></svg>';
    }
    if (type === "sterile-filtration") {
      return '<svg viewBox="0 0 500 150" class="w-full h-36 bg-[#040a14] rounded-2xl border border-emerald-400/30 p-3"><rect x="15" y="22" width="145" height="106" rx="10" fill="#0f172a" stroke="#38bdf8"/><text x="28" y="48" fill="#38bdf8" font-size="11" font-weight="bold">STEP 1: STERILE WATER</text><text x="28" y="68" fill="#cbd5e1" font-size="10">Single-use ampoule or</text><text x="28" y="84" fill="#cbd5e1" font-size="10">freshly boiled water</text><rect x="177" y="22" width="145" height="106" rx="10" fill="#0f172a" stroke="#fbbf24"/><text x="190" y="48" fill="#fbbf24" font-size="11" font-weight="bold">STEP 2: CLEAN COOKER</text><text x="190" y="68" fill="#cbd5e1" font-size="10">Dissolve cleanly in</text><text x="190" y="84" fill="#cbd5e1" font-size="10">sterile spoon/cooker</text><rect x="340" y="22" width="145" height="106" rx="10" fill="#0f172a" stroke="#34d399"/><text x="352" y="48" fill="#34d399" font-size="11" font-weight="bold">STEP 3: MICRON/COTTON</text><text x="352" y="68" fill="#cbd5e1" font-size="10">Draw through sterile</text><text x="352" y="84" fill="#cbd5e1" font-size="10">filter (bevel down in cotton)</text></svg>';
    }
    return '<svg viewBox="0 0 500 130" class="w-full h-32 bg-[#040a14] rounded-2xl border border-sky-400/30 p-3"><rect x="16" y="16" width="468" height="98" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-dasharray="4 3"/><text x="250" y="58" text-anchor="middle" fill="#38bdf8" font-size="13" font-weight="bold">CLINICAL VISUAL DIAGRAM &amp; PHOTO PLACEHOLDER</text><text x="250" y="82" text-anchor="middle" fill="#94a3b8" font-size="11">Add custom photo URL via imageUrl in public/harm-reduction-data.js</text></svg>';
  }

  function renderHub() {
    var container = document.getElementById("harm-reduction-content");
    if (!container) return;
    var topics = window.TNS_HARM_REDUCTION_TOPICS || [];
    container.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-5">' + topics.map(function (t) {
      var st = colorStyles[t.badgeColor] || colorStyles.sky;
      return '<button type="button" data-topic-id="' + t.id + '" class="text-left p-6 rounded-[1.75rem] bg-[#071224]/90 border ' + st.border + ' transition-all flex flex-col justify-between gap-5 shadow-xl cursor-pointer group hover:-translate-y-0.5"><div><span class="inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ' + st.badge + ' mb-3">' + t.badge + '</span><h2 class="text-xl font-black text-white group-hover:text-skyGlow">' + t.title + '</h2><p class="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">' + t.subtitle + '</p></div><div class="pt-4 border-t border-white/10 flex items-center justify-between"><span class="text-xs font-bold text-slate-400">Diagrams + Gated Video</span><span class="px-4 py-2 rounded-full font-black text-xs ' + st.btn + '">Open Module →</span></div></button>';
    }).join("") + '</div>';
    container.querySelectorAll("[data-topic-id]").forEach(function (btn) {
      btn.addEventListener("click", function () { window.location.hash = btn.getAttribute("data-topic-id") || ""; });
    });
  }

  function renderTopicPage(topic) {
    var container = document.getElementById("harm-reduction-content");
    if (!container) return;
    var visualsHtml = (topic.visuals || []).map(function (v) {
      var media = v.imageUrl
        ? '<img src="' + v.imageUrl + '" alt="' + v.title + '" class="w-full max-h-64 object-contain rounded-2xl bg-black/50 border border-white/10" />'
        : getDiagramSvg(v.diagramType);
      return '<div class="p-5 rounded-3xl bg-[#071224]/95 border border-skyGlow/30 space-y-3"><div class="text-sm font-black text-skyGlow">' + v.title + '</div>' + media + '<p class="text-xs text-slate-300 leading-relaxed">' + v.caption + '</p></div>';
    }).join("");

    var vEmbed = topic.videoEmbed;
    var isIframe = vEmbed && vEmbed.videoUrl && /youtube\.com|youtu\.be|vimeo\.com|embed/i.test(vEmbed.videoUrl);
    var videoPlayerHtml = vEmbed && vEmbed.videoUrl
      ? (isIframe
          ? '<iframe src="' + vEmbed.videoUrl + '" class="w-full aspect-video rounded-2xl border border-white/15 bg-black" allowfullscreen></iframe>'
          : '<video src="' + vEmbed.videoUrl + '" controls class="w-full rounded-2xl border border-white/15 bg-black max-h-80"></video>')
      : '<div class="p-6 rounded-2xl bg-black/60 border border-dashed border-rose-400/40 text-center space-y-1"><p class="text-xs font-black text-rose-300">Instructional Video Player Ready</p><p class="text-[11px] text-slate-400">Paste a YouTube embed URL or .mp4 path into videoEmbed.videoUrl in public/harm-reduction-data.js</p></div>';
    var videoHtml = vEmbed ? (
      '<div class="p-5 rounded-3xl bg-rose-950/30 border border-rose-500/40 space-y-3">' +
        '<div class="flex items-center justify-between flex-wrap gap-2"><span class="text-sm font-black text-white">' + vEmbed.title + '</span><span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">Gated Instructional Media</span></div>' +
        '<p class="text-xs text-rose-200">' + vEmbed.warningText + '</p>' +
        '<button type="button" id="reveal-video-btn" class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-obsidian font-black text-xs cursor-pointer transition">I Understand Trigger Warning — Reveal Video Player</button>' +
        '<div id="gated-video-slot" class="hidden pt-2">' + videoPlayerHtml + '</div>' +
      '</div>'
    ) : "";

    var sectionsHtml = (topic.sections || []).map(function (sec) {
      var items = sec.bullets.map(function (b) { return '<li class="flex items-start gap-3 text-sm text-slate-200 leading-relaxed"><span class="w-2 h-2 rounded-full bg-skyGlow shrink-0 mt-2"></span><span>' + b + '</span></li>'; }).join("");
      return '<div class="p-6 rounded-3xl bg-[#071224]/95 border border-white/10 space-y-3"><h3 class="text-lg font-black text-amber-300">' + sec.heading + '</h3><ul class="space-y-2.5">' + items + '</ul></div>';
    }).join("");

    container.innerHTML = '<div class="space-y-6"><div class="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/10"><button type="button" id="back-to-hub-top" class="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-black text-xs cursor-pointer">← Back to All Harm Reduction Topics</button><span class="text-xs font-extrabold text-rose-300 bg-rose-500/15 border border-rose-400/30 px-3.5 py-1.5 rounded-full">Strictly Educational • Not to Glorify</span></div><div class="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 font-semibold">' + topic.summaryWarning + '</div><div class="grid grid-cols-1 md:grid-cols-2 gap-4">' + visualsHtml + '</div>' + videoHtml + '<div class="space-y-4">' + sectionsHtml + '</div></div>';

    var backBtn = document.getElementById("back-to-hub-top");
    if (backBtn) backBtn.addEventListener("click", function () { history.pushState("", document.title, window.location.pathname + window.location.search); renderHub(); });
    var revBtn = document.getElementById("reveal-video-btn");
    var vidSlot = document.getElementById("gated-video-slot");
    if (revBtn && vidSlot) revBtn.addEventListener("click", function () { vidSlot.classList.remove("hidden"); revBtn.classList.add("hidden"); });
  }

  function handleRoute() {
    var hash = (window.location.hash || "").replace(/^#/, "");
    var matched = (window.TNS_HARM_REDUCTION_TOPICS || []).find(function (t) { return t.id === hash; });
    if (matched) renderTopicPage(matched); else renderHub();
  }
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
})();
