// bg.js (extraits)

const AB_URL = "https://gp-eff.alwaysdata.net/xdockplus/AB/ab_status_backend.php";
const CONTACTS_URL = "https://gp-eff.alwaysdata.net/xdockplus/contacts/api.php";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      // -------- CONTACTS ----------
      if (msg?.type === "CONTACTS_GET") {
        const r = await fetch(CONTACTS_URL, { cache: "no-store" });
        const data = await r.json().catch(() => null);
        const text = data ? undefined : await r.text().catch(() => "");
        return sendResponse({ ok: true, status: r.status, data, text });
      }

      if (msg?.type === "CONTACTS_POST") {
        const r = await fetch(CONTACTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg.body || {})
        });
        const data = await r.json().catch(() => null);
        const text = data ? undefined : await r.text().catch(() => "");
        return sendResponse({ ok: true, status: r.status, data, text });
      }

      if (msg?.type === "CONTACTS_DELETE") {
        const r = await fetch(CONTACTS_URL, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: msg.id })
        });
        const data = await r.json().catch(() => null);
        const text = data ? undefined : await r.text().catch(() => "");
        return sendResponse({ ok: true, status: r.status, data, text });
      }

      // -------- AB (si tu l’utilises encore) ----------
      if (msg?.type === "AB_GET") {
        const r = await fetch(AB_URL, { cache: "no-store" });
        const data = await r.json().catch(() => null);
        const text = data ? undefined : await r.text().catch(() => "");
        return sendResponse({ ok: true, status: r.status, data, text });
      }
      if (msg?.type === "AB_SET") {
        const r = await fetch(AB_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tournee: msg.tournee, ab: !!msg.ab })
        });
        const data = await r.json().catch(() => null);
        const text = data ? undefined : await r.text().catch(() => "");
        return sendResponse({ ok: true, status: r.status, data, text });
      }

      sendResponse({ ok: false, error: "type_inconnu" });
    } catch (e) {
      sendResponse({ ok: false, error: String(e) });
    }
  })();
  return true;
});
