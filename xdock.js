// === JABBER CHAMP FORMULAIRE EM/SM ===
(function () {
  if (!/\/EM|\/SM/.test(location.href)) return;

  const allInputs = document.querySelectorAll("input");
  let phoneInput = null;

  for (let input of allInputs) {
    const label = input.closest("td, div")?.innerText?.toLowerCase() || "";
    const val = input.value.trim();
    const isPhoneLike = /^\+?\d{9,15}$/.test(val);
    const labelLooksLikePhone = label.includes("téléphone") || label.includes("pager");

    if (isPhoneLike && labelLooksLikePhone) {
      phoneInput = input;
      break;
    }
  }

  if (!phoneInput || document.getElementById("jabber-call-button")) return;

  const rawPhone = phoneInput.value.trim().replace(/\D/g, "");
  const phone = phoneInput.value.startsWith("+") ? phoneInput.value : `+${rawPhone}`;

  const btn = document.createElement("a");
  btn.id = "jabber-call-button";
  btn.href = `ciscotel:${phone}`;
  btn.title = "Appeler avec Cisco Jabber";
  btn.style.marginLeft = "8px";
  btn.style.verticalAlign = "middle";
  btn.style.display = "inline-block";

  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="#007AFF" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C10.3 22.13 1.88 13.7 1.88 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.26 2.67.76 3.88a1 1 0 01-.21 1.11l-2.3 2.3z"/></svg>`;
  phoneInput.parentElement.appendChild(btn);
})();

// === JABBER COLONNE TABLEAU ===
(function () {
  const validPages = [
    "/Taskmanagement/TaskmanagementInArbeit",
    "/Taskmanagement/Abfahrbereit",
    "/Taskmanagement/InHouse",
    "/Taskmanagement/Yardmanagement",
    "/Taskmanagement"
  ];
  if (!validPages.some(p => location.pathname.startsWith(p))) return;

  const observer = new MutationObserver(() => {
    document.querySelectorAll("table tbody tr").forEach((ligne) => {
      ligne.querySelectorAll("td").forEach((cell) => {
        const tel = cell.textContent.trim();
        const clean = tel.replace(/\D/g, "");
        const isPhone = tel.startsWith("+") && clean.length >= 9 && clean.length <= 15;
        const hasIcon = cell.querySelector(".jabber-icon");

        if (!isPhone || hasIcon) return;

        const icon = document.createElement("a");
        icon.href = `ciscotel:${tel}`;
        icon.className = "jabber-icon";
        icon.title = `Appeler ${tel} avec Jabber`;
        icon.style.marginLeft = "6px";
        icon.style.verticalAlign = "middle";
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="#007AFF" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C10.3 22.13 1.88 13.7 1.88 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.26 2.67.76 3.88a1 1 0 01-.21 1.11l-2.3 2.3z"/></svg>`;
        cell.appendChild(icon);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();

// === CODE BARRE PAGE SM ===
(function () {
  if (!location.pathname.includes("/Warenausgang/")) return;

  const porteInput = document.querySelector("input[id*='door']") || document.querySelector("input[value^='T']");
  const porte = porteInput?.value.trim() || "T25";

  const mini = document.createElement("div");
  mini.id = "barcode-mini";
  mini.style = "margin-top:10px;background:#fff;border:1px solid #000;padding:8px;width:fit-content;cursor:pointer;";
  mini.innerHTML = `<canvas id="barcodeCanvas" width="120" height="40"></canvas>`;
  porteInput?.parentElement?.appendChild(mini);

  const zoom = document.createElement("div");
  zoom.id = "barcode-zoom";
  zoom.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:none;z-index:999999;justify-content:center;align-items:center;";
  zoom.innerHTML = `<div style="position:relative;background:white;padding:20px;border-radius:10px;max-width:90vw;"><span id="closeZoom" style="position:absolute;top:10px;right:10px;cursor:pointer;font-size:20px;color:#444;">❌</span><h2 style="text-align:center;">Porte ${porte}</h2><canvas id="barcodeZoom" width="600" height="150" style="display:block;margin:0 auto;"></canvas></div>`;
  document.body.appendChild(zoom);

  function encode128(data) {
    const codes = [104];
    for (let i = 0; i < data.length; i++) {
      const code = data.charCodeAt(i);
      codes.push(code >= 32 && code <= 126 ? code - 32 : 0);
    }
    let checksum = codes[0];
    for (let i = 1; i < codes.length; i++) checksum += codes[i] * i;
    codes.push(checksum % 103, 106);
    return codes;
  }

  const patterns = {/* table complète CODE128 ici */};

  function codeToBars(code) {
    return patterns[code] || "";
  }

  function drawBarcode(canvas, data, scale = 6) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bars = encode128(data).map(codeToBars).join("") + "11";
    let x = 10;
    for (let i = 0; i < bars.length; i++) {
      ctx.fillStyle = bars[i] === "1" ? "#000" : "#fff";
      ctx.fillRect(x, 10, scale, 120);
      x += scale;
    }
  }

  mini.onclick = () => {
    drawBarcode(document.getElementById("barcodeZoom"), porte, 9);
    zoom.style.display = "flex";
  };
  zoom.querySelector("#closeZoom").onclick = () => zoom.style.display = "none";
  document.addEventListener("keydown", e => e.key === "Escape" && (zoom.style.display = "none"));
  drawBarcode(document.getElementById("barcodeCanvas"), porte, 2);
})();
