/* app.js — كل أكواد JavaScript للموقع: الدوال المشتركة ثم كود كل صفحة */
/* وظائف مشتركة: التخزين، تسجيل الدخول، حماية الصفحات، تسجيل الخروج */
const Store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};

const Auth = {
  user() { return Store.get('mh_session', null); },
  register(name, email, password) {
    const users = Store.get('mh_users', []);
    if (users.some(u => u.email === email)) return { ok: false, error: 'هذا البريد مسجّل من قبل. سجّل الدخول بدلاً من ذلك.' };
    users.push({ name, email, password });
    Store.set('mh_users', users);
    Store.set('mh_session', { name, email });
    return { ok: true };
  },
  login(email, password) {
    const u = Store.get('mh_users', []).find(x => x.email === email && x.password === password);
    if (!u) return { ok: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
    Store.set('mh_session', { name: u.name, email: u.email });
    return { ok: true };
  },
  logout() { localStorage.removeItem('mh_session'); }
};

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.user();
  // الصفحات المحمية تتطلب تسجيل دخول
  if (document.body.dataset.protected === 'true' && !user) { location.replace('index.html'); return; }
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user ? user.name : '');
  const out = document.getElementById('logout');
  if (out) out.addEventListener('click', () => Auth.logout());
  const mb = document.getElementById('menuBtn'), nav = document.getElementById('mainNav');
  if (mb && nav) mb.addEventListener('click', () => nav.classList.toggle('open'));
  const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
});

/* ===== صفحة index ===== */
(function () {
  if (document.body.dataset.page !== 'index') return;
  if (Auth.user()) { location.replace('home.html'); return; }

  const $ = id => document.getElementById(id);
  const tabs = { login: $('tabLogin'), signup: $('tabSignup') };
  const forms = { login: $('loginForm'), signup: $('signupForm') };

  function show(which) {
    for (const k in tabs) {
      tabs[k].classList.toggle('on', k === which);
      forms[k].classList.toggle('hidden', k !== which);
    }
  }
  tabs.login.onclick = () => show('login');
  tabs.signup.onclick = () => show('signup');
  $('toSignup').onclick = e => { e.preventDefault(); show('signup'); };
  $('toLogin').onclick = e => { e.preventDefault(); show('login'); };
  if (location.hash === '#signup') show('signup');

  function error(el, text) { el.className = 'msg err'; el.textContent = text; }
  const validEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  forms.login.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('lEmail').value.trim().toLowerCase(), pass = $('lPass').value;
    if (!validEmail(email) || !pass) return error($('lMsg'), 'أدخل بريداً إلكترونياً صحيحاً وكلمة المرور.');
    const r = Auth.login(email, pass);
    r.ok ? location.href = 'home.html' : error($('lMsg'), r.error);
  });

  forms.signup.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('sName').value.trim(), email = $('sEmail').value.trim().toLowerCase();
    const p1 = $('sPass').value, p2 = $('sPass2').value, m = $('sMsg');
    if (name.length < 3) return error(m, 'اكتب اسمك الكامل (3 أحرف على الأقل).');
    if (!validEmail(email)) return error(m, 'أدخل بريداً إلكترونياً صحيحاً.');
    if (p1.length < 6) return error(m, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
    if (p1 !== p2) return error(m, 'كلمتا المرور غير متطابقتين.');
    const r = Auth.register(name, email, p1);
    r.ok ? location.href = 'home.html' : error(m, r.error);
  });
})();

/* ===== صفحة progress ===== */
(function () {
  if (document.body.dataset.page !== 'progress') return;
  const user = Auth.user(); if (!user) return;
  const KEY = 'mh_progress_' + user.email;
  const $ = id => document.getElementById(id);
  const SURAHS = ['الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس'];

  let data = Store.get(KEY, { juz: 0, logs: [] });
  const save = () => Store.set(KEY, data);

  SURAHS.forEach((s, i) => $('surah').add(new Option((i + 1) + '. ' + s, s)));
  for (let i = 0; i <= 30; i++) $('juz').add(new Option(i + ' جزء', i));
  $('date').value = new Date().toISOString().slice(0, 10);

  function render() {
    const logs = data.logs;
    $('stJuz').textContent = data.juz;
    $('stNew').textContent = logs.filter(l => l.type === 'حفظ جديد').length;
    $('stRev').textContent = logs.filter(l => l.type === 'مراجعة').length;
    $('stAvg').textContent = logs.length ? (logs.reduce((a, l) => a + l.rating, 0) / logs.length).toFixed(1) : '–';
    const pct = Math.round(data.juz / 30 * 100);
    $('bar').style.width = pct + '%';
    $('barTxt').textContent = pct + '% من القرآن الكريم';
    $('juz').value = data.juz;

    const body = $('rows'); body.innerHTML = '';
    if (!logs.length) {
      const tr = body.insertRow(), td = tr.insertCell();
      td.colSpan = 6; td.className = 'empty'; td.textContent = 'لا توجد جلسات بعد. سجّل أول جلسة من النموذج أعلاه.';
      return;
    }
    logs.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach(l => {
      const tr = body.insertRow();
      tr.insertCell().textContent = l.date;
      const t = tr.insertCell(), tag = document.createElement('span');
      tag.className = 'tag' + (l.type === 'مراجعة' ? ' rev' : ''); tag.textContent = l.type; t.appendChild(tag);
      tr.insertCell().textContent = l.surah;
      tr.insertCell().textContent = l.from + ' – ' + l.to;
      tr.insertCell().textContent = l.rating + ' / 5';
      const d = document.createElement('button');
      d.className = 'del'; d.type = 'button'; d.textContent = 'حذف';
      d.onclick = () => { data.logs = data.logs.filter(x => x.id !== l.id); save(); render(); };
      tr.insertCell().appendChild(d);
    });
  }

  $('juz').onchange = e => { data.juz = +e.target.value; save(); render(); };

  $('logForm').addEventListener('submit', e => {
    e.preventDefault();
    const from = +$('from').value, to = +$('to').value, m = $('msg');
    if (!$('date').value) { m.className = 'msg err'; m.textContent = 'اختر التاريخ.'; return; }
    if (!from || !to || from < 1 || to < from) { m.className = 'msg err'; m.textContent = 'أدخل نطاق آيات صحيحاً (الآية الأخيرة لا تقل عن الأولى).'; return; }
    data.logs.push({ id: Date.now(), date: $('date').value, type: $('type').value, surah: $('surah').value, from, to, rating: +$('rating').value });
    save(); render();
    $('from').value = ''; $('to').value = '';
    m.className = 'msg ok'; m.textContent = 'تم حفظ الجلسة.';
  });

  render();
})();

/* ===== صفحة contact ===== */
(function () {
  if (document.body.dataset.page !== 'contact') return;
  const user = Auth.user(); if (!user) return;
  const $ = id => document.getElementById(id);
  $('name').value = user.name; $('email').value = user.email;

  $('contactForm').addEventListener('submit', e => {
    e.preventDefault();
    const m = $('msg'), name = $('name').value.trim(), email = $('email').value.trim(), text = $('text').value.trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { m.className = 'msg err'; m.textContent = 'أدخل اسمك وبريداً إلكترونياً صحيحاً.'; return; }
    if (text.length < 10) { m.className = 'msg err'; m.textContent = 'اكتب رسالة لا تقل عن 10 أحرف.'; return; }
    // حالياً تُحفظ الرسائل في المتصفح فقط. اربطها بخادم أو خدمة بريد لإرسالها فعلياً.
    const all = Store.get('mh_messages', []);
    all.push({ name, email, phone: $('phone').value.trim(), subject: $('subject').value, text, date: new Date().toISOString() });
    Store.set('mh_messages', all);
    $('text').value = '';
    m.className = 'msg ok'; m.textContent = 'تم إرسال رسالتك. شكراً لتواصلك.';
  });
})();

/* ===== صفحة mushaf ===== */
(function () {
  if (document.body.dataset.page !== 'mushaf') return;
  const user = Auth.user(); if (!user) return;
  const API = 'https://api.alquran.cloud/v1', KEY = 'mh_mushaf_' + user.email;
  const $ = id => document.getElementById(id);
  const toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  const norm = s => s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '').replace(/[ٱأإآ]/g, 'ا');
  // عرض أي خطأ برمجي داخل الصفحة نفسها لتسهيل التشخيص
  window.addEventListener('error', e => { const s = $('status'); if (s) s.textContent = 'خطأ في الكود: ' + e.message + ' (سطر ' + e.lineno + ')'; });
  window.addEventListener('unhandledrejection', e => { const s = $('status'); if (s) s.textContent = 'خطأ: ' + ((e.reason && e.reason.message) || e.reason); });
  let st = Store.get(KEY, { surah: 1, size: 1.4, bm: null, v: 2 });
  if (st.v !== 2) { st.size = 1.4; st.v = 2; } // إعادة ضبط حجم الخط الافتراضي مرة واحدة
  const save = () => Store.set(KEY, st);
  let surahs = [], cur = 0;

  // يجلب من الإنترنت أول مرة ثم يحفظ نسخة في المتصفح للقراءة لاحقاً
  async function load(path, ck) {
    const c = Store.get(ck, null); if (c) return c;
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 12000);
    let r; try { r = await fetch(API + path, { signal: ctl.signal }); } finally { clearTimeout(t); }
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json(); if (j.code !== 200) throw new Error('bad response');
    try { Store.set(ck, j.data); } catch (e) { /* مساحة التخزين ممتلئة: نتجاوز الحفظ */ }
    return j.data;
  }
  function fail(e) {
    const box = $('ayahs'); box.textContent = '';
    const p = document.createElement('p');
    p.textContent = 'تعذّر تحميل المصحف (' + (e && e.name === 'AbortError' ? 'انتهت المهلة' : (e && e.message) || 'خطأ غير معروف') + '). تأكد من اتصال الإنترنت ثم أعد المحاولة.';
    const b = document.createElement('button'); b.className = 'btn dark'; b.type = 'button'; b.textContent = 'إعادة المحاولة';
    b.onclick = () => init();
    const l = document.createElement('a'); l.href = API + '/surah/1/quran-uthmani'; l.target = '_blank'; l.textContent = 'اختبر الاتصال بالمصدر';
    l.style.cssText = 'font-size:1rem;margin-inline-start:14px;text-decoration:underline';
    box.append(p, b, l);
  }
  const size = () => { $('ayahs').style.fontSize = st.size + 'rem'; $('bism').style.fontSize = st.size + 'rem'; };

  function mark(n, a) {
    document.querySelectorAll('.ay.mark').forEach(e => e.classList.remove('mark'));
    const el = $('a' + a); if (el && st.bm && st.bm.surah === n && st.bm.ayah === a) el.classList.add('mark');
  }

  function render(d, focus) {
    const n = d.number; cur = n; st.surah = n; save();
    $('surah').value = n;
    $('title').textContent = d.name;
    $('meta').textContent = (d.revelationType === 'Meccan' ? 'مكية' : 'مدنية') + ' · ' + toAr(d.numberOfAyahs) + ' آية';
    $('bism').hidden = (n === 1 || n === 9);
    const box = $('ayahs'); box.textContent = '';
    d.ayahs.forEach(a => {
      let t = a.text;
      // نزيل البسملة من أول آية إن كانت مضمّنة في النص، لنعرضها كعنوان منفصل
      if (n !== 1 && n !== 9 && a.numberInSurah === 1 && norm(t).startsWith('بسم الله الرحمن الرحيم'))
        t = t.trim().split(/\s+/).slice(4).join(' ');
      const sp = document.createElement('span');
      sp.className = 'ay'; sp.id = 'a' + a.numberInSurah;
      sp.append(t + ' ');
      const no = document.createElement('span'); no.className = 'no'; no.textContent = toAr(a.numberInSurah);
      sp.append(no, ' ');
      sp.onclick = () => {
        st.bm = { surah: n, ayah: a.numberInSurah }; save(); mark(n, a.numberInSurah);
        $('status').textContent = 'تم وضع العلامة عند الآية ' + toAr(a.numberInSurah) + ' من سورة ' + d.name + '.';
      };
      box.append(sp);
    });
    $('jump').max = d.numberOfAyahs;
    if (st.bm && st.bm.surah === n) mark(n, st.bm.ayah);
    if (focus) { const el = $('a' + focus); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    else window.scrollTo({ top: 0 });
  }

  async function open(n, focus) {
    n = Math.min(114, Math.max(1, +n)); $('ayahs').textContent = 'جارٍ التحميل…';
    try { render(await load('/surah/' + n + '/quran-uthmani', 'mh_q_s' + n), focus); } catch (e) { fail(e); }
  }

  $('surah').onchange = e => open(e.target.value);
  $('prev').onclick = () => open(cur - 1);
  $('next').onclick = () => open(cur + 1);
  $('bigger').onclick = () => { st.size = Math.min(3.2, +(st.size + .2).toFixed(1)); save(); size(); };
  $('smaller').onclick = () => { st.size = Math.max(1, +(st.size - .2).toFixed(1)); save(); size(); };
  $('jump').addEventListener('change', e => { const a = +e.target.value; if (a >= 1) { const el = $('a' + a); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
  $('resume').onclick = () => {
    if (!st.bm) { $('status').textContent = 'لم تضع علامة بعد. اضغط على آية لوضع علامة.'; return; }
    st.bm.surah === cur ? $('a' + st.bm.ayah).scrollIntoView({ behavior: 'smooth', block: 'center' }) : open(st.bm.surah, st.bm.ayah);
  };

  async function init() {
    size();
    $('ayahs').textContent = 'جارٍ الاتصال بالمصدر…'; $('status').textContent = 'نسخة الملف: 3';
    try { surahs = await load('/surah', 'mh_q_list'); } catch (e) { return fail(e); }
    $('surah').textContent = '';
    surahs.forEach(s => $('surah').add(new Option(s.number + '. ' + s.name, s.number)));
    st.bm ? open(st.bm.surah, st.bm.ayah) : open(st.surah);
  }
  init();
})();
