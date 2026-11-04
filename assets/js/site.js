document.documentElement.classList.add('js');
if (window.lucide) lucide.createIcons();
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- Nav ---------------- */
const navEl = document.getElementById('site-nav-wrap');
const onScrollNav = () => navEl.classList.toggle('scrolled', window.scrollY > 40);
onScrollNav();
window.addEventListener('scroll', onScrollNav, { passive: true });

const mobileNavToggle = document.getElementById('mobile-nav-toggle');
const mobileNavPanel = document.getElementById('mobile-nav-panel');
function openMobileNav() {
    mobileNavPanel.hidden = false;
    requestAnimationFrame(() => mobileNavPanel.classList.add('active'));
    mobileNavToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('modal-open');
}
function closeMobileNav() {
    if (!mobileNavPanel || mobileNavPanel.hidden) return;
    mobileNavPanel.classList.remove('active');
    mobileNavToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('modal-open');
    setTimeout(() => { if (!mobileNavPanel.classList.contains('active')) mobileNavPanel.hidden = true; }, 260);
}
mobileNavToggle.addEventListener('click', openMobileNav);
window.addEventListener('resize', () => { if (window.innerWidth > 1040) closeMobileNav(); });

/* ---------------- Reveal ---------------- */
const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
document.querySelectorAll('.rv').forEach((el) => io.observe(el));

/* ---------------- Count up ---------------- */
const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        const el = e.target, target = +el.dataset.count;
        if (REDUCED) { el.textContent = target; return; }
        const t0 = performance.now(), dur = 1400;
        const tick = (now) => {
            const k = Math.min(1, (now - t0) / dur);
            el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
            if (k < 1) requestAnimationFrame(tick);
        };
        el.textContent = '0';
        requestAnimationFrame(tick);
    });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

/* ---------------- Videos: play only while visible ---------------- */
const MOBILE = window.matchMedia('(max-width: 760px)');
const vidIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting && !REDUCED && !v.dataset.userPaused) {
            if (!v.currentSrc && v.dataset.src) v.src = v.dataset.src;
            v.play().catch(() => {});
        } else if (!e.isIntersecting && !v.paused) v.pause();
    });
}, { threshold: 0.35 });
['hero-video', 'hero-video-m', 'film-b', 'film-b-m'].forEach((id) => { const v = document.getElementById(id); if (v) vidIO.observe(v); });

if (document.getElementById('film-toggle')) {
const filmB = document.getElementById('film-b'), filmBm = document.getElementById('film-b-m');
const activeFilm = () => (MOBILE.matches ? filmBm : filmB);
const filmToggle = document.getElementById('film-toggle');
function setToggleIcon(paused) {
    filmToggle.innerHTML = `<i data-lucide="${paused ? 'play' : 'pause'}"></i>`;
    filmToggle.setAttribute('aria-label', paused ? 'Play video' : 'Pause video');
    if (window.lucide) lucide.createIcons();
}
filmToggle.addEventListener('click', () => {
    const v = activeFilm();
    if (!v.currentSrc) v.src = v.dataset.src;
    if (v.paused) { delete v.dataset.userPaused; v.play().catch(() => {}); }
    else { v.dataset.userPaused = '1'; v.pause(); }
});
[filmB, filmBm].forEach((v) => {
    v.addEventListener('play', () => { if (v === activeFilm()) setToggleIcon(false); });
    v.addEventListener('pause', () => { if (v === activeFilm()) setToggleIcon(true); });
});
document.getElementById('film-full').addEventListener('click', () => {
    const v = activeFilm();
    if (!v.currentSrc) v.src = v.dataset.src;
    delete v.dataset.userPaused;
    v.play().catch(() => {});
    (v.requestFullscreen || v.webkitEnterFullscreen || v.webkitRequestFullscreen)?.call(v);
});
if (REDUCED) setToggleIcon(true);
}

/* ---------------- Logo marquee (mobile) ---------------- */
const logoRow = document.querySelector('.logo-row');
if (logoRow) [...logoRow.children].forEach((img) => {
    const c = img.cloneNode(true);
    c.classList.add('dup'); c.alt = ''; c.setAttribute('aria-hidden', 'true');
    logoRow.appendChild(c);
});

/* ---------------- Problem: notification feed ---------------- */
(function feed() {
    const APPS = { S: ['#4A154B', 'Slack'], M: ['#EA4335', 'Email'], W: ['#1FAF55', 'WhatsApp'], C: ['#7B68EE', 'ClickUp'], N: ['#191919', 'Notion'], D: ['#2F5BFF', 'Direct message'], G: ['#0F9D58', 'Sheets'] };
    const items = [
        ['S', '#launch', '9:14', 'who owns the Q4 creative??'],
        ['M', 'Retail partner', '9:16', 'Re: Re: Re: onboarding docs?'],
        ['W', 'Ops lead', '9:21', 'PO for SKU-204 still not sent'],
        ['S', '#marketing', '9:26', '@founder can you approve the landing page?'],
        ['C', 'ClickUp', '9:30', '3 tasks overdue, no assignee'],
        ['G', 'Sheets', '9:34', 'content_calendar_FINAL_v3 was edited'],
        ['D', 'Head of growth', '9:41', 'is the KPI deck updated for today?'],
        ['M', 'Agency', '9:47', 'Still waiting on feedback from Friday'],
        ['N', 'Notion', '9:52', 'Launch plan (old, check Slack instead)'],
        ['S', '#cx', '9:58', 'customers asking when the bundle ships']
    ];
    const list = document.getElementById('feed-list');
    if (!list) return;
    const cnt = document.getElementById('feed-count'), clock = document.getElementById('feed-time');
    const make = ([a, ch, tm, msg]) => {
        const el = document.createElement('div'); el.className = 'nt';
        el.innerHTML = `<span class="ap" style="background:${APPS[a][0]}">${APPS[a][1][0]}</span><div class="tx"><div class="mt"><span><b>${APPS[a][1]}</b> · ${ch}</span><span>${tm} AM</span></div><p>${msg}</p></div>`;
        return el;
    };
    let i = 0, timer = null, visible = false;
    function step() {
        if (!visible) return;
        if (i >= items.length) { timer = setTimeout(() => { list.innerHTML = ''; i = 0; cnt.textContent = '0'; step(); }, 3200); return; }
        const el = make(items[i]); el.classList.add('in'); list.prepend(el);
        while (list.children.length > 7) list.lastChild.remove();
        cnt.textContent = ++i; clock.textContent = items[i - 1][2] + ' AM';
        timer = setTimeout(step, 1100);
    }
    if (REDUCED) { items.slice(0, 6).reverse().forEach((it) => list.appendChild(make(it))); cnt.textContent = items.length; return; }
    new IntersectionObserver((es) => {
        const was = visible; visible = es[0].isIntersecting;
        if (visible && !was) { clearTimeout(timer); step(); }
        if (!visible) clearTimeout(timer);
    }, { threshold: 0.25 }).observe(list);
})();

/* ---------------- How it works: stepper (desktop) / timeline (mobile) ---------------- */
(function flow() {
    const wrap = document.getElementById('flow');
    if (!wrap) return;
    const steps = [...wrap.querySelectorAll('.fstep')];
    const panels = steps.map((s) => document.getElementById(s.getAttribute('aria-controls')));
    const DUR = 8000;
    let cur = 0, auto = !REDUCED, timer = null, visible = false;
    function countUp(panel) {
        panel.querySelectorAll('[data-to]').forEach((el) => {
            const to = +el.dataset.to;
            if (REDUCED) { el.textContent = to; return; }
            const linear = to === 5, t0 = performance.now() + (linear ? 700 : 800), dur = linear ? 2700 : 2600;
            el.textContent = '0';
            const tick = (now) => { const k = Math.max(0, Math.min(1, (now - t0) / dur)); el.textContent = Math.round(to * (linear ? k : 1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
            requestAnimationFrame(tick);
        });
    }
    function play(panel) { panel.classList.remove('play'); void panel.offsetWidth; panel.classList.add('play'); countUp(panel); }
    function schedule() {
        clearTimeout(timer);
        steps.forEach((s) => { const p = s.querySelector('.prog'); p.style.transition = 'none'; p.style.transform = 'scaleX(0)'; });
        if (!auto || !visible || MOBILE.matches) return;
        const p = steps[cur].querySelector('.prog');
        void p.offsetWidth;
        p.style.transition = `transform ${DUR}ms linear`; p.style.transform = 'scaleX(1)';
        timer = setTimeout(() => show((cur + 1) % steps.length), DUR);
    }
    function show(i, user) {
        cur = i;
        steps.forEach((s, j) => { const on = j === i; s.setAttribute('aria-selected', on); s.tabIndex = on ? 0 : -1; panels[j].hidden = !on; if (!on) panels[j].classList.remove('play'); });
        play(panels[i]);
        if (user) auto = false;
        schedule();
    }
    steps.forEach((s, i) => {
        s.addEventListener('click', () => show(i, true));
        s.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
            const n = (i + (e.key === 'ArrowRight' ? 1 : steps.length - 1)) % steps.length;
            show(n, true); steps[n].focus();
        });
    });
    // Mobile: every stage stacked; each one animates as it scrolls into view
    const panelIO = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting && MOBILE.matches && !e.target.classList.contains('play')) play(e.target);
    }), { threshold: 0.35 });
    function applyMode() {
        clearTimeout(timer);
        if (MOBILE.matches) {
            wrap.classList.add('stack');
            panels.forEach((p) => { p.hidden = false; p.removeAttribute('role'); p.classList.remove('play'); panelIO.observe(p); });
        } else {
            wrap.classList.remove('stack');
            panels.forEach((p) => { panelIO.unobserve(p); p.setAttribute('role', 'tabpanel'); });
            show(cur);
        }
    }
    new IntersectionObserver((es) => {
        const was = visible; visible = es[0].isIntersecting;
        if (visible && !was && !MOBILE.matches) show(cur);
        if (!visible) clearTimeout(timer);
    }, { threshold: 0.3 }).observe(wrap);
    MOBILE.addEventListener('change', applyMode);
    applyMode();
})();

/* ---------------- Swipe carousels (mobile) ---------------- */
document.querySelectorAll('.swipe').forEach((track) => {
    const items = [...track.children];
    const dots = document.createElement('div');
    dots.className = 'swipe-dots';
    dots.setAttribute('aria-hidden', 'true');
    items.forEach((it, i) => {
        const d = document.createElement('button');
        d.type = 'button'; d.tabIndex = -1;
        d.addEventListener('click', () => track.scrollTo({ left: it.offsetLeft - track.offsetLeft - 24, behavior: 'smooth' }));
        dots.appendChild(d);
    });
    track.after(dots);
    const update = () => {
        const w = items[0].getBoundingClientRect().width + 12;
        const i = Math.min(items.length - 1, Math.round(track.scrollLeft / w));
        [...dots.children].forEach((d, j) => d.classList.toggle('on', j === i));
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
});

/* ---------------- Sticky booking bar (mobile) ---------------- */
(function stickyBar() {
    const bar = document.getElementById('mbar'), btn = bar.querySelector('button');
    let pastHero = false, nearEnd = false;
    const set = () => {
        const on = pastHero && !nearEnd && MOBILE.matches;
        bar.classList.toggle('show', on);
        bar.setAttribute('aria-hidden', on ? 'false' : 'true');
        btn.tabIndex = on ? 0 : -1;
    };
    new IntersectionObserver((es) => { pastHero = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; set(); }).observe(document.querySelector('.hero-ctas'));
    new IntersectionObserver((es) => { nearEnd = es.some((e) => e.isIntersecting); set(); }).observe(document.getElementById('book-cta'));
    MOBILE.addEventListener('change', set);
})();

/* ---------------- Systems gallery ---------------- */
if (document.getElementById('gal-img')) {
const GAL = [{"k": "creative", "t": "Creative production", "imgs": [{"s": "creative-intake", "c": "Creative board: requests move from intake to editing, with an owner on every card"}, {"s": "creative-live", "c": "The same board downstream: ready to upload, ads live and recurring tasks"}, {"s": "creative-dashboard", "c": "Creative output dashboard: briefs by month, strategist and product"}, {"s": "calendar", "c": "Marketing calendar: campaigns, launches and retail moments on one timeline"}], "b": "Briefs arrive in DMs, approvals get lost in threads, and nobody is sure what’s live.", "a": "Every request enters through one form and moves through review to live, with approvals recorded on the task.", "f": "107 live ads, each linked back to its original brief"}, {"k": "reporting", "t": "Dashboards & reporting", "imgs": [{"s": "throughput", "c": "Team throughput: completed, open and overdue work at a glance"}, {"s": "goals", "c": "Company goals with owners, targets and live progress (owners and targets blurred)"}, {"s": "portfolio", "c": "Portfolio view: every project’s status, progress and owner"}, {"s": "scorecard", "c": "Weekly company scorecard: every KPI with an owner and a target"}], "b": "Status lives in people’s heads, and someone rebuilds the weekly report by hand.", "a": "Dashboards read straight from the work: what’s late, where capacity is tight and what’s done.", "f": ""}, {"k": "pipelines", "t": "Production pipelines", "imgs": [{"s": "mo-dashboard", "c": "Manufacturing orders: open orders, completion and cycle time"}, {"s": "bizops-funnel", "c": "BizOps rollout: phased initiatives with owner, priority and due date"}, {"s": "rules", "c": "Routing rule: finishing one stage moves work into the next"}, {"s": "request-approvals", "c": "Request template with approval gates for design, copy and development"}], "b": "Orders and handoffs are tracked across spreadsheets, chats and memory.", "a": "One production board across teams. Rules move work between stages and assign the next owner.", "f": "21 manufacturing orders tracked by stage and owner"}, {"k": "onboarding", "t": "Onboarding & wiki", "imgs": [{"s": "onboarding", "c": "Onboarding template: contracts, access, orientation and 30/60-day check-ins"}, {"s": "wiki-home", "c": "Company wiki: mission, updates and new-hire onboarding in one place"}, {"s": "wiki-hubs", "c": "Team hubs: every department’s resources one click away"}, {"s": "team-wiki", "c": "The living playbook new hires start from"}], "b": "New hires learn from whoever has time, and knowledge leaves when people do.", "a": "A reusable onboarding project plus a company wiki, so every hire gets the same start.", "f": ""}, {"k": "sops", "t": "SOP system", "imgs": [{"s": "way-framework", "c": "Operating framework hub: execution engine, source of truth and training"}, {"s": "sop-hubs", "c": "Department and process hubs that link each SOP where the work happens"}, {"s": "role-resources", "c": "Role resources: tools, standards, templates and training for each seat"}], "b": "Processes live in a few people’s heads and a folder nobody opens.", "a": "A searchable SOP register with owners and review dates, linked from the tasks that use it.", "f": ""}, {"k": "planning", "t": "OKRs & process maps", "imgs": [{"s": "okr-goal", "c": "Company objective with sub-goals, an owner and live progress"}, {"s": "okr-list", "c": "Key results broken into dated, owned tasks"}, {"s": "launch-template", "c": "Product launch template: every step timed from kickoff"}, {"s": "process-flowchart", "c": "Discovery session output: product development flowchart"}, {"s": "process-swimlanes", "c": "Swimlane map of who owns each step of a new-product launch"}], "b": "Goals are set in a deck, then forgotten until next quarter.", "a": "Objectives linked to key results and the tasks behind them, with processes mapped before we build.", "f": ""}];
const gtabs = [...document.querySelectorAll('.gtab')];
const galImg = document.getElementById('gal-img'), galThumbs = document.getElementById('gal-thumbs');
let galCat = 0, galIdx = 0;
function galShow(idx) {
    const c = GAL[galCat];
    galIdx = (idx + c.imgs.length) % c.imgs.length;
    const it = c.imgs[galIdx];
    galImg.style.opacity = .35;
    const pre = new Image();
    pre.onload = () => { galImg.src = pre.src; galImg.alt = it.c; galImg.style.opacity = 1; };
    pre.src = `assets/shots/${it.s}.jpg`;
    document.getElementById('gal-cap').textContent = it.c;
    document.getElementById('gal-count').textContent = `${galIdx + 1} / ${c.imgs.length}`;
    [...galThumbs.children].forEach((t, n) => t.setAttribute('aria-current', n === galIdx ? 'true' : 'false'));
}
function galSelect(i) {
    galCat = i;
    const c = GAL[i];
    gtabs.forEach((t, n) => { t.setAttribute('aria-selected', n === i); t.tabIndex = n === i ? 0 : -1; });
    galThumbs.innerHTML = c.imgs.map((it, n) => `<button type="button" data-n="${n}" aria-label="Show: ${it.c}"><img src="assets/shots/t/${it.s}.jpg" alt="" loading="lazy"></button>`).join('');
    document.getElementById('gal-before').textContent = c.b;
    document.getElementById('gal-after').textContent = c.a;
    const f = document.getElementById('gal-fact');
    f.hidden = !c.f; f.querySelector('span').textContent = c.f;
    galShow(0);
}
galThumbs.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) galShow(+b.dataset.n); });
document.getElementById('gal-prev').addEventListener('click', () => galShow(galIdx - 1));
document.getElementById('gal-next').addEventListener('click', () => galShow(galIdx + 1));
gtabs.forEach((t, i) => {
    t.addEventListener('click', () => { galSelect(i); if (window.innerWidth <= 960) t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); });
    t.addEventListener('keydown', (e) => {
        if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
        e.preventDefault();
        const n = (i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : gtabs.length - 1)) % gtabs.length;
        galSelect(n); gtabs[n].focus();
    });
});
let gx = null;
const stage = document.querySelector('.gal-stage');
stage.addEventListener('touchstart', (e) => { gx = e.touches[0].clientX; }, { passive: true });
stage.addEventListener('touchend', (e) => { if (gx === null) return; const dx = e.changedTouches[0].clientX - gx; if (Math.abs(dx) > 40) galShow(galIdx + (dx < 0 ? 1 : -1)); gx = null; });
galSelect(0);
document.getElementById('gal-main').addEventListener('click', (e) => {
    const c = GAL[galCat];
    openLightbox(c.imgs.map((it) => ({ src: `assets/shots/${it.s}.jpg`, cap: it.c })), galIdx, e.currentTarget);
});
}

/* ---------------- Overlays (shared) ---------------- */
function openOverlay(el) {
    el.classList.add('active');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => el.querySelector('.x-btn')?.focus(), 40);
}
function closeOverlay(el) {
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

/* ---------------- Lightbox ---------------- */
const lightbox = document.getElementById('lightbox');
let lbReturn = null, lbList = [], lbIdx = 0;
function lbRender() {
    const it = lbList[lbIdx], img = document.getElementById('lightbox-img');
    img.src = it.src; img.alt = it.cap;
    document.getElementById('lightbox-cap').textContent = lbList.length > 1 ? `${it.cap}  ·  ${lbIdx + 1} / ${lbList.length}` : it.cap;
    lightbox.classList.toggle('multi', lbList.length > 1);
}
function openLightbox(list, idx, from) {
    lbList = list; lbIdx = idx || 0; lbReturn = from || document.activeElement;
    lbRender(); openOverlay(lightbox);
}
function lbStep(d) { if (lbList.length < 2) return; lbIdx = (lbIdx + d + lbList.length) % lbList.length; lbRender(); }
document.addEventListener('click', (e) => {
    const b = e.target.closest('.zoomable');
    if (!b) return;
    openLightbox([{ src: b.dataset.full, cap: b.dataset.title || '' }], 0, b);
});
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowRight') lbStep(1);
    if (e.key === 'ArrowLeft') lbStep(-1);
});
function closeLightbox() { closeOverlay(lightbox); lbReturn?.focus(); }
lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target.tagName === 'FIGURE') closeLightbox(); });
let lx = null;
lightbox.addEventListener('touchstart', (e) => { lx = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', (e) => { if (lx === null) return; const dx = e.changedTouches[0].clientX - lx; if (Math.abs(dx) > 40) lbStep(dx < 0 ? 1 : -1); lx = null; });

/* ---------------- Hasan video ---------------- */
const videoModal = document.getElementById('video-modal');
const hasanVideo = document.getElementById('hasan-video');
let vmReturn = null;
function openVideoModal() {
    vmReturn = document.activeElement;
    if (!hasanVideo.currentSrc) hasanVideo.src = hasanVideo.dataset.src;
    openOverlay(videoModal);
    hasanVideo.play().catch(() => {});
}
function closeVideoModal() { hasanVideo.pause(); closeOverlay(videoModal); vmReturn?.focus?.(); }
videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });

/* ---------------- Case study data ---------------- */
const csData = {
    pridola: {
        client: 'Pridola', industry: 'E-commerce · Shopify Plus', logo: 'assets/logos/pridola-design.png', badge: 'Client-reported result',
        headline: 'The weekly status meeting was deleted',
        lead: 'Eight people spent sixty minutes every week reporting status that was already stale by the time the meeting ended.',
        shot: { src: 'assets/cases/pridola-dashboard.jpg', cap: 'Illustrative: a live operations dashboard of the same type, shown in our demo workspace.', real: false },
        facts: [ { v: '8', l: 'people in the weekly meeting' }, { v: '60 min', l: 'every single week' }, { v: '0', l: 'status meetings after launch' } ],
        why: [ 'Eight team-hours went into one recurring meeting.', 'Updates expired soon after the meeting ended.', 'Leadership time went to collecting status instead of deciding.' ],
        built: [ 'Live Asana operations dashboard', 'Automated task-level status reporting', 'A defined swim lane for each contributor', 'Portfolio view for manager review' ],
        note: 'The concrete before-and-after: 8 people × 60 minutes, then a retired weekly status meeting. Eight team-hours returned each week, as reported by the client after launch.'
    },
    solawave: {
        client: 'Solawave', industry: 'Beauty · D2C skincare', logo: 'assets/logos/solawave.png', badge: 'Delivered system',
        headline: 'Three teams. One operating model.',
        lead: 'Marketing, product and operations each had their own way of working, and leadership rebuilt status through repeated check-ins.',
        shot: { src: 'assets/cases/solawave-board.jpg', cap: 'Illustrative: a shared delivery board of the same type, shown in our demo workspace.', real: false },
        facts: [ { v: '30 days', l: 'implementation window' }, { v: '3 teams', l: 'marketing, product and operations' }, { v: '1 model', l: 'shared workflow architecture' } ],
        why: [ 'Each team used a different definition of done.', 'Leadership depended on collecting status by hand.', 'Handoffs weren’t governed by one shared workflow.' ],
        built: [ 'Company-wide Asana architecture', 'Standard delivery workflows across three teams', 'OKR structure linking strategy to execution', 'Executive dashboard and recurring-work automation' ],
        note: 'Implementation scope and artifacts are documented. We don’t publish outcome percentages without the baseline and follow-up data to back them.'
    },
    roostys: {
        client: 'Roosty’s', industry: 'Wellness · Supplements', logo: 'assets/logos/roostys.svg', badge: 'Implementation scope',
        headline: 'Four tools mapped into one system',
        lead: 'Work was spread across ClickUp, Notion, Slack and email, and supply-chain knowledge sat with a few individuals.',
        shot: { src: 'assets/cases/roostys-mo-dashboard.jpg', cap: 'Roosty’s workspace: the manufacturing orders dashboard in Asana. Sensitive details blurred.', real: true },
        facts: [ { v: '4 tools', l: 'in the original stack' }, { v: '3 weeks', l: 'implementation sprint' }, { v: '1 target', l: 'central Asana architecture' } ],
        why: [ 'Four tools split ownership and execution.', 'Inventory status needed manual chasing.', 'Knowledge was concentrated in a few operators.' ],
        built: [ 'Central Asana workflow architecture', 'Migration plan for active operational work', 'Inventory and manufacturing-order visibility views', 'SOP and training structure' ],
        note: 'This describes the delivered implementation. The engagement ended before long-term adoption could be independently measured, so we don’t claim full tool retirement.'
    },
    bnb: {
        client: 'Black & Black', industry: 'Digital commerce agency', logo: 'assets/logos/black-and-black.png', badge: 'Founder experience',
        headline: 'Shopify delivery on stage gates, not heroics',
        lead: 'Complex Shopify builds depended on manual coordination between strategy, design, development and QA.',
        shot: { src: 'assets/cases/bnb-handoff-rule.jpg', cap: 'Illustrative: an automated handoff rule of the same type, shown in our demo workspace.', real: false },
        facts: [ { v: '1', l: 'shared delivery pipeline' }, { v: 'Auto', l: 'handoffs between phases' }, { v: 'QA', l: 'gates before every launch' } ],
        why: [ 'Each new project added manual coordination.', 'Handoffs depended on memory and follow-up.', 'Delivery quality relied on individual heroics.' ],
        built: [ 'Standardised delivery stages', 'Automated phase handoffs', 'Client-facing milestone coordination', 'Reusable project templates and QA gates' ],
        note: 'Led by Hasan Ijaz before KlarityOps was founded, and included here as relevant founder experience.'
    }
};

const csOverlay = document.getElementById('cs-modal');
const csPanel = document.getElementById('cs-modal-panel');
let csReturn = null;
function openCaseStudy(key) {
    closeMobileNav();
    const d = csData[key];
    if (!d) return;
    csReturn = document.activeElement;
    csPanel.innerHTML = `
        <div class="cs-top"><img src="${d.logo}" alt="${d.client}"><div class="cs-top-r"><span class="tag">${d.industry}</span><button class="x-btn" onclick="closeCaseStudy()" aria-label="Close case study"><i data-lucide="x"></i></button></div></div>
        <figure class="cs-shot"><button type="button" class="zoomable" data-full="${d.shot.src}" data-title="${d.client}: ${d.shot.real ? 'real workspace' : 'illustrative view'}"><img src="${d.shot.src}" alt="${d.shot.cap}"><span class="shot-tag${d.shot.real ? ' real' : ''}">${d.shot.real ? 'Real screen · data blurred' : 'Demo workspace view'}</span></button><figcaption>${d.shot.cap}</figcaption></figure>
        <div class="cs-body">
            <span class="ev-badge"><i data-lucide="shield-check"></i>${d.badge}</span>
            <h2 id="cs-modal-title">${d.headline}</h2>
            <p class="cs-lead">${d.lead}</p>
            <div class="cs-res">${d.facts.map(r => `<div><b>${r.v}</b><span>${r.l}</span></div>`).join('')}</div>
            <div class="cs-cols">
                <div class="cs-block"><h3>Why it mattered</h3><ul class="cs-why">${d.why.map(w => `<li><i data-lucide="circle-alert"></i>${w}</li>`).join('')}</ul></div>
                <div class="cs-block"><h3>What we built</h3><ol class="cs-built">${d.built.map((b, n) => `<li><span>${n + 1}</span>${b}</li>`).join('')}</ol></div>
            </div>
            <p class="cs-note"><i data-lucide="info"></i><span><b>Evidence note.</b> ${d.note}</span></p>
            <button class="btn btn-block" onclick="closeCaseStudy(); openBookingModal('case_study_modal', 'Free 20-Min Fit Call');">Book a free 20-min call <i data-lucide="arrow-right"></i></button>
        </div>`;
    if (window.lucide) lucide.createIcons();
    csPanel.scrollTop = 0;
    openOverlay(csOverlay);
}
function closeCaseStudy(event) {
    if (event && event.target !== csOverlay) return;
    closeOverlay(csOverlay);
    csReturn?.focus?.();
}

/* ---------------- Booking modal ---------------- */
let currentFormStep = 1;
const bookingModal = document.getElementById('booking-modal');
const stepBackBtn = document.getElementById('stepBackBtn');
const stepNextBtn = document.getElementById('stepNextBtn');
const submitBtn = document.getElementById('submitBtn');
const totalSteps = 3;
const BOOKING_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxD1uWf89A44zFaGfs1tRw40_tiYS-LMuhcUY-sOwGg5mUQI-d26TTJ8EsRDPjlvFnc/exec';
let bookingReturn = null;

function updateStepUI() {
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.toggle('active', Number(step.dataset.step) === currentFormStep);
    });
    document.querySelectorAll('.step-pill').forEach(pill => {
        const pillStep = Number(pill.dataset.stepPill);
        pill.classList.toggle('active', pillStep === currentFormStep);
        pill.classList.toggle('done', pillStep < currentFormStep);
    });
    stepBackBtn.classList.toggle('hidden', currentFormStep === 1);
    stepNextBtn.classList.toggle('hidden', currentFormStep === totalSteps);
    submitBtn.classList.toggle('hidden', currentFormStep !== totalSteps);

    const stepLabels = ['Basic info', 'Company snapshot', 'Main bottleneck'];
    let liveEl = document.getElementById('form-step-live');
    if (!liveEl) {
        liveEl = document.createElement('span');
        liveEl.id = 'form-step-live';
        liveEl.setAttribute('aria-live', 'polite');
        liveEl.className = 'sr-only';
        document.body.appendChild(liveEl);
    }
    liveEl.textContent = `Step ${currentFormStep} of ${totalSteps}: ${stepLabels[currentFormStep - 1]}`;
}

function validateStep(stepNumber) {
    const step = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
    if (!step) return true;
    const fields = [...step.querySelectorAll('input[required], select[required], textarea[required]')];
    for (const field of fields) {
        if (!field.reportValidity()) return false;
    }
    return true;
}

function nextFormStep() {
    if (!validateStep(currentFormStep)) return;
    currentFormStep = Math.min(totalSteps, currentFormStep + 1);
    updateStepUI();
    document.querySelector(`.form-step[data-step="${currentFormStep}"]`)?.querySelector('input, select, textarea')?.focus();
}

function prevFormStep() {
    currentFormStep = Math.max(1, currentFormStep - 1);
    updateStepUI();
}

// Default offer is the free fit call: the entry point to every engagement,
// and what all paid ads promise. Pricing CTAs pass their own offer.
const DEFAULT_OFFER = 'Free 20-Min Fit Call';

function handleOfferChange(nextOffer) {
    const normalizedOffer = nextOffer || DEFAULT_OFFER;
    document.getElementById('selectedOffer').value = normalizedOffer;
    document.getElementById('selectedOfferDisplay').value = normalizedOffer;
}

function setBookingContext(source, offer) {
    const normalizedSource = source || 'generic_cta';
    const normalizedOffer = offer || DEFAULT_OFFER;
    document.getElementById('ctaSource').value = normalizedSource;
    document.getElementById('originOffer').value = normalizedOffer;
    document.getElementById('pageUrl').value = window.location.href;
    document.getElementById('pageTitle').value = document.title;
    handleOfferChange(normalizedOffer);
}

function openBookingModal(source, offer) {
    closeMobileNav();
    bookingReturn = document.activeElement;
    setBookingContext(source, offer);
    currentFormStep = 1;
    updateStepUI();
    bookingModal.classList.add('active');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => document.getElementById('selectedOfferDisplay')?.focus(), 40);
}

// ---- Deep link: open the booking modal straight from a URL ----
//   ?book=1                              → opens with the default offer
//   ?book=1&offer=BizOps%20Retainer      → opens with that offer preselected
//   ?book=1&src=google_ads_bizops        → records where it came from
//   #book                                → same as ?book=1
window.addEventListener('load', function openFromUrl() {
    const VALID_OFFERS = [
        'Free 20-Min Fit Call',
        'Systems Audit & Roadmap',
        'Systems Audit + AI Audit Combo',
        'One-Off Build',
        'BizOps Retainer',
        'Build Sprint'
    ];
    const params = new URLSearchParams(window.location.search);
    const wantsBooking = params.get('book') === '1' || window.location.hash === '#book';
    if (!wantsBooking) return;
    const rawOffer = (params.get('offer') || '').trim();
    const offer = VALID_OFFERS.find(function (o) { return o.toLowerCase() === rawOffer.toLowerCase(); }) || DEFAULT_OFFER;
    const src = (params.get('src') || 'url_deeplink').slice(0, 60);
    openBookingModal(src, offer);
});

// Focus trap for every dialog
function trapFocus(modalEl) {
    modalEl.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab' || !modalEl.classList.contains('active')) return;
        const focusable = [...modalEl.querySelectorAll('a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, video[controls], [tabindex]:not([tabindex="-1"])')]
            .filter(el => el.offsetParent !== null);
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
}
[bookingModal, csOverlay, lightbox, videoModal].forEach(trapFocus);

function closeBookingModal() {
    bookingModal.classList.remove('active');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    bookingReturn?.focus?.();
}

bookingModal.addEventListener('click', (event) => {
    if (event.target === bookingModal) closeBookingModal();
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (bookingModal.classList.contains('active')) closeBookingModal();
    else if (csOverlay.classList.contains('active')) closeCaseStudy();
    else if (lightbox.classList.contains('active')) closeLightbox();
    else if (videoModal.classList.contains('active')) closeVideoModal();
    else closeMobileNav();
});

updateStepUI();

// Form handler
//   1. Supabase insert  — primary store, the only one we can verify
//   2. Apps Script POST — mirror into the Google Sheet the team reads
//   3. Conversions      — fired before we leave the domain
//   4. NeetoCal redirect
async function submitForm(e) {
    e.preventDefault();
    if (!validateStep(currentFormStep)) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting…';
    submitBtn.disabled = true;
    stepNextBtn.disabled = true;
    stepBackBtn.disabled = true;

    document.getElementById('form-error-msg')?.remove();

    // Column names match public.leads exactly.
    const row = Object.assign({
        full_name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        brand_name: document.getElementById('brand').value,
        monthly_revenue: document.getElementById('rev').value,
        team_size: document.getElementById('team').value,
        tools: document.getElementById('tools').value,
        pain_point: document.getElementById('pain').value,
        selected_offer: document.getElementById('selectedOffer').value,
        origin_offer: document.getElementById('originOffer').value,
        cta_source: document.getElementById('ctaSource').value,
        page_url: document.getElementById('pageUrl').value || window.location.href,
        page_title: document.getElementById('pageTitle').value || document.title,
        user_agent: navigator.userAgent
    }, getAttribution());

    const showError = function (html) {
        const form = document.getElementById('klarity-intake');
        const errEl = document.createElement('p');
        errEl.id = 'form-error-msg';
        errEl.innerHTML = html;
        form.appendChild(errEl);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        stepNextBtn.disabled = false;
        stepBackBtn.disabled = false;
    };

    // ---- 1. PRIMARY: Supabase ----
    let saved = false;
    try {
        const { error } = await sb.from('leads').insert(row);
        if (error) console.error('Supabase insert failed:', error);
        else saved = true;
    } catch (err) {
        console.error('Supabase insert threw:', err);
    }

    // ---- 2. MIRROR: Google Sheet. Fire and forget. ----
    // The Apps Script expects the original camelCase keys; keep this shape.
    const attr = getAttribution();
    const sheetPayload = {
        fullName: row.full_name,
        email: row.email,
        brandName: row.brand_name,
        monthlyRevenue: row.monthly_revenue,
        teamSize: row.team_size,
        tools: row.tools,
        painPoint: row.pain_point,
        selectedOffer: row.selected_offer,
        originOffer: row.origin_offer,
        ctaSource: row.cta_source,
        pageUrl: row.page_url,
        pageTitle: row.page_title,
        submittedAt: new Date().toISOString(),
        userAgent: row.user_agent,
        gclid: attr.gclid,
        fbclid: attr.fbclid,
        utmSource: attr.utm_source,
        utmMedium: attr.utm_medium,
        utmCampaign: attr.utm_campaign,
        utmContent: attr.utm_content,
        utmTerm: attr.utm_term,
        firstLanding: attr.first_landing,
        referrer: attr.referrer,
        savedToSupabase: saved
    };

    let mirrorQueued = false;
    try {
        const body = JSON.stringify(sheetPayload);
        if (navigator.sendBeacon) {
            mirrorQueued = navigator.sendBeacon(
                BOOKING_WEBHOOK_URL,
                new Blob([body], { type: 'text/plain;charset=utf-8' })
            );
        }
        if (!mirrorQueued) {
            fetch(BOOKING_WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                keepalive: true,
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: body
            }).catch(function () { /* opaque response */ });
            mirrorQueued = true;
        }
    } catch (err) {
        console.error('Sheet mirror error:', err);
    }

    // Both destinations dead: do not redirect, the lead would vanish.
    if (!saved && !mirrorQueued) {
        showError(
            'Something went wrong saving your details. Please email ' +
            '<a href="mailto:hello@klarityops.com">hello@klarityops.com</a> ' +
            'and we’ll get you booked in.'
        );
        return;
    }
    if (!saved) {
        console.warn('Lead not in Supabase; relying on the Sheet mirror. Check the project is not paused.');
    }

    // ---- 3. Conversions, then redirect ----
    const nameEnc = encodeURIComponent(row.full_name);
    const emailEnc = encodeURIComponent(row.email);
    const bookingUrl = `https://thexponent.neetocal.com/discovery-call?name=${nameEnc}&email=${emailEnc}`;

    let redirected = false;
    const go = function () {
        if (redirected) return;
        redirected = true;
        window.location.href = bookingUrl;
    };

    const nameParts = (row.full_name || '').trim().split(/\s+/);
    const firstName = (nameParts[0] || '').toLowerCase();
    const lastName = (nameParts.length > 1 ? nameParts[nameParts.length - 1] : '').toLowerCase();
    const emailNorm = (row.email || '').trim().toLowerCase();

    // ---- Meta: Lead event + manual Advanced Matching ----
    try {
        if (typeof fbq === 'function') {
            if (META_PIXEL_ID) {
                fbq('init', META_PIXEL_ID, { em: emailNorm, fn: firstName, ln: lastName });
            }
            fbq('track', 'Lead', {
                content_name: row.selected_offer || 'fit_call',
                value: 150,
                currency: 'USD'
            });
        }
    } catch (err) { console.error('fbq error:', err); }

    // ---- Google Ads: conversion + Enhanced Conversions ----
    try {
        if (typeof gtag === 'function' && GOOGLE_ADS_CONVERSION) {
            gtag('set', 'user_data', {
                email: emailNorm,
                address: { first_name: firstName, last_name: lastName }
            });
            gtag('event', 'conversion', {
                send_to: GOOGLE_ADS_CONVERSION,
                value: 150.0,
                currency: 'USD',
                event_callback: go
            });
            setTimeout(go, 1200);   // safety net if the callback never fires
        } else {
            go();
        }
    } catch (err) {
        console.error('gtag error:', err);
        go();
    }
}

/* ---------------- Old homepage anchors now live on their own pages ---------------- */
(function movedAnchors() {
    const MOVED = { '#demo': 'asana.html#demo', '#builds': 'asana.html#builds', '#delivery': 'asana.html#delivery', '#roadmap': 'roadmap.html', '#team-section': 'team.html', '#testimonials': 'case-studies.html#testimonials', '#fit': 'faq.html#fit' };
    if (MOVED[location.hash]) location.replace(MOVED[location.hash]);
})();

