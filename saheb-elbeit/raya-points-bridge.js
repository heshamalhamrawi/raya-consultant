/* جسر «صاحب البيت» ↔ «منصة المستشار»
   - لو المستشار داخل من المنصة: بيانات تسجيله (الاسم، HRID، الفرع، مدير الفرع، مدير المنطقة) بتتملى لوحدها
   - كل إجابة صح في اللعبة بتتسجل في صندوق مشترك، والمنصة تحوّلها نقط (الغرف والشهادات المنصة بتقراها لوحدها)
   - زرار «رجوع للمنصة» فوق
   بيتحط قبل app.js:  <script src="raya-points-bridge.js"></script>
   شرط واحد: اللعبة والمنصة على نفس الدومين (والنسخة اللي جوه فولدر المنصة جاهزة بالفعل). */
(function () {
  var INBOX = 'raya_points_inbox', SAVE = 'saheb-elbeit-v3', MAX = 300;
  function get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: the game keeps working */ } }

  // 1) prefill registration from the platform login (only empty fields)
  var u = get('rc_user');
  if (u && u.code) {
    var s = get(SAVE) || {};
    var fill = { name: u.name, hrid: u.code, branch: u.branch, mgr: u.bm, area: u.am }, changed = false;
    for (var k in fill) if (fill[k] && !s[k]) { s[k] = fill[k]; changed = true; }
    if (changed) set(SAVE, s);
  }

  // 2) every right answer → shared inbox
  function hash(t) { var h = 5381; for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function push(item) {
    var box = get(INBOX) || [];
    if (box.some(function (x) { return x.id === item.id; })) return;
    box.push(item); if (box.length > MAX) box = box.slice(-MAX);
    set(INBOX, box);
  }
  function watch() {
    var seen = null;
    new MutationObserver(function () {
      var fb = document.getElementById('fbBox');
      if (!fb || !fb.firstChild) { seen = null; return; }
      var v = fb.querySelector('.verdict');
      if (!v || fb === seen) return;
      seen = fb;
      if (!v.classList.contains('best')) return;
      var scene = document.getElementById('scene');
      var q = scene && (scene.querySelector('.q') || scene.querySelector('p'));
      var text = (q ? q.textContent : '') + '|' + ((fb.querySelector('.ref') || {}).textContent || '');
      push({ id: 'g' + hash(text), kind: 'game_q', ts: Date.now() });
    }).observe(document.body, { childList: true, subtree: true });

    // 3) back to the platform: inside the platform it just closes the game (instant), otherwise it links back
    var embedded = window.parent !== window;
    var back = embedded ? '#' : (/[?&]from=rc\b/.test(location.search) ? '../index.html#/' : null);
    if (back) {
      var a = document.createElement('a');
      a.href = back; a.textContent = '→ رجوع للمنصة';
      a.setAttribute('style', 'position:fixed;bottom:max(env(safe-area-inset-bottom),6px);left:50%;transform:translateX(-50%);z-index:9999;background:rgba(0,23,128,.85);color:#fff;font:700 12px/1 system-ui,sans-serif;padding:8px 12px;border-radius:999px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.25)');
      if (embedded) a.addEventListener('click', function (e) { e.preventDefault(); try { window.dispatchEvent(new MessageEvent('message', { data: { rc: 'game-stop' } })); } catch (x) {} try { window.parent.postMessage({ rc: 'game-close' }, '*'); } catch (x) {} });
      document.body.appendChild(a);
    }
  }
  if (document.body) watch(); else document.addEventListener('DOMContentLoaded', watch);
})();
