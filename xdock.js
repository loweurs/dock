// 6 : 1 script tet, 2 destination, 3 code barre, 4 Nombre(s) de camoion jour/Avance dans le parc, 5 Recharche de AB dans le parc, 6 statut 44, 

// === Cisco Jabber pour la page EM/SM (champ Téléphone/Pager) ===

(function () {
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

  btn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="#007AFF" viewBox="0 0 24 24">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C10.3 22.13 1.88 13.7 1.88 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.26 2.67.76 3.88a1 1 0 01-.21 1.11l-2.3 2.3z"/>
    </svg>`;
  phoneInput.parentElement.appendChild(btn);
})();

// === Cisco Jabber dans les colonnes Tél./pager (pages listées) ===
(function () {
  const validPages = [
    "/Taskmanagement/TaskmanagementInArbeit",
    "/Taskmanagement/Abfahrbereit",
    "/Taskmanagement/InHouse",
    "/Taskmanagement/Yardmanagement",
    "/Taskmanagement"
  ];

  const isTargetPage = validPages.some(url => window.location.pathname.startsWith(url));
  if (!isTargetPage) return;

  const observer = new MutationObserver(() => {
    const lignes = document.querySelectorAll("table tbody tr");

    lignes.forEach((ligne) => {
      const cellules = ligne.querySelectorAll("td");
      cellules.forEach((cell) => {
        const telText = cell.textContent.trim();
        const cleaned = telText.replace(/\D/g, "");
        const isPhoneLike = telText.startsWith("+") && cleaned.length >= 9 && cleaned.length <= 15;
        const alreadyIcon = cell.querySelector(".jabber-icon");

        if (!isPhoneLike || alreadyIcon) return;

        const icon = document.createElement("a");
        icon.href = `ciscotel:${telText}`;
        icon.title = `Appeler ${telText} avec Jabber`;
        icon.className = "jabber-icon";
        icon.style.marginLeft = "6px";
        icon.style.verticalAlign = "middle";
        icon.style.display = "inline-block";

        icon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" fill="#007AFF" viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.49 2.53.76 3.88.76a1 1 0 011 1v3.5a1 1 0 01-1 1C10.3 22.13 1.88 13.7 1.88 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.26 2.67.76 3.88a1 1 0 01-.21 1.11l-2.3 2.3z"/>
          </svg>`;

        // Ajoute l’icône sans effacer le numéro
        cell.appendChild(icon);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();

// === Lien cliquable sur les destinations (Synthèse du camion uniquement) ===

(function () {
  const isSyntheseCamionPage = window.location.pathname.includes("/Taskmanagement/LkwUebersicht");

  if (!isSyntheseCamionPage) return;

  
  const destinations = {
    "Alcalá": "alc", "Beaucaire": "bea", "Vitoria": "vit", "Palmela": "palm", "Valencia": "vlc", "Ablis": "abl",
    "Arcs-sur-Argens": "asa", "Barbery": "barb", "Barcelona": "bcn", "Baziège": "baz", "Béziers": "bez",
    "Carquefou": "caq", "Cestas": "cet", "Chanteloup-Les-Vignes": "clv", "Entzheim": "ent", "Gondreville": "gon",
    "Gran Canaria": "gca", "Granada": "grn", "Honguemare-Guenouville": "hon", "La Chapelle D'Armentières": "lca",
    "Le Coudray-Montceaux": "lcm", "Liffré": "lif", "Loures": "lou", "Málaga": "mlg", "Martorell": "mat",
    "Meaux": "mea", "Montchanin": "montc", "Montoy Flanville": "mfv", "Murcia": "mur", "Narón": "naró",
    "Plouagat": "plo", "Pontcharra": "pch", "Provence": "pro", "Sailly-lez-Cambrai": "slc",
    "Saint Augustin": "aug", "Saint Quentin Fallavier": "sqf", "Santo Tirso": "san", "Sevilla": "sev",
    "Sorigny": "sor", "Tarragona": "trg", "Tenerife": "ten", "Torres Novas": "ton", "Vars": "var"
  };

  function rendreCliquables() {
    const cellules = document.querySelectorAll('td');
    const dateDuJour = new Date().toISOString().split('T')[0];

    cellules.forEach((cellule) => {
      const texte = cellule.innerText.trim();
      if (destinations[texte] && !cellule.querySelector('a')) {
        const codeRecherche = destinations[texte];
        const lien = document.createElement('a');
        lien.href = `/Warenausgang/Tag?sort=StatusASC&selecteddate=${dateDuJour}&search=${encodeURIComponent(codeRecherche)}`;
        lien.innerText = texte;
        lien.style.color = '#000000';
        lien.style.textDecoration = 'underline';
        lien.title = `Ouvrir la page de sortie pour ${texte}`;

        cellule.innerHTML = '';
        cellule.appendChild(lien);
      }
    });
  }

  const observer = new MutationObserver(() => {
    rendreCliquables();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  rendreCliquables();
})();

// === Générateur de code-barres dynamique ===

(function () {
  if (!window.location.pathname.startsWith("/Warenausgang/")) return;

   const oldMini = document.getElementById("barcode-mini");
  const oldZoom = document.getElementById("barcode-zoom");
  if (oldMini) oldMini.remove();
  if (oldZoom) oldZoom.remove();

  const porteInput = document.querySelector("input[id*='door']") || document.querySelector("input[value^='T']");
  const porte = porteInput ? porteInput.value.trim() : "T25";

  const miniContainer = document.createElement("div");
  miniContainer.id = "barcode-mini";
  miniContainer.style.marginTop = "10px";
  miniContainer.style.background = "#fff";
  miniContainer.style.border = "1px solid #000";
  miniContainer.style.padding = "8px";
  miniContainer.style.width = "fit-content";
  miniContainer.style.cursor = "pointer";
  miniContainer.innerHTML = `<canvas id="barcodeCanvas" width="120" height="40"></canvas>`;

  if (porteInput && porteInput.parentElement) {
    porteInput.parentElement.appendChild(miniContainer);
  }

  const zoomOverlay = document.createElement("div");
  zoomOverlay.id = "barcode-zoom";
  zoomOverlay.style.position = "fixed";
  zoomOverlay.style.top = "0";
  zoomOverlay.style.left = "0";
  zoomOverlay.style.width = "100%";
  zoomOverlay.style.height = "100%";
  zoomOverlay.style.background = "rgba(0,0,0,0.7)";
  zoomOverlay.style.display = "none";
  zoomOverlay.style.zIndex = 999999;
  zoomOverlay.style.justifyContent = "center";
  zoomOverlay.style.alignItems = "center";

  zoomOverlay.innerHTML = `
    <div style="position: relative; background:white; padding:20px; border-radius:10px; max-width:90vw;">
      <span id="closeZoom" style="position:absolute;top:10px;right:10px;cursor:pointer;font-size:20px;color:#444;">❌</span>
      <h2 style="text-align:center;">Porte ${porte}</h2>
      <canvas id="barcodeZoom" width="600" height="150" style="display:block;margin:0 auto;"></canvas>
    </div>
  `;
  document.body.appendChild(zoomOverlay);

  function encode128(data) {
    const codes = [104];
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i);
      codes.push(charCode >= 32 && charCode <= 126 ? charCode - 32 : 0);
    }
    let checksum = codes[0];
    for (let i = 1; i < codes.length; i++) checksum += codes[i] * i;
    codes.push(checksum % 103);
    codes.push(106);
    return codes;
  }

  function codeToBars(code) {
    const patterns = {
      0: "11011001100", 1: "11001101100", 2: "11001100110", 3: "10010011000", 4: "10010001100", 5: "10001001100",
      6: "10011001000", 7: "10011000100", 8: "10001100100", 9: "11001001000", 10: "11001000100", 11: "11000100100",
      12: "10110011100", 13: "10011011100", 14: "10011001110", 15: "10111001100", 16: "10011101100", 17: "10011100110",
      18: "11001110010", 19: "11001011100", 20: "11001001110", 21: "11011100100", 22: "11001110100", 23: "11101101110",
      24: "11101001100", 25: "11100101100", 26: "11100100110", 27: "11101100100", 28: "11100110100", 29: "11100110010",
      30: "11011011000", 31: "11011000110", 32: "11000110110", 33: "10100011000", 34: "10001011000", 35: "10001000110",
      36: "10110001000", 37: "10001101000", 38: "10001100010", 39: "11010001000", 40: "11000101000", 41: "11000100010",
      42: "10110111000", 43: "10110001110", 44: "10001101110", 45: "10111011000", 46: "10111000110", 47: "10001110110",
      48: "11101110110", 49: "11010001110", 50: "11000101110", 51: "11011101000", 52: "11011100010", 53: "11011101110",
      54: "11101011000", 55: "11101000110", 56: "11100010110", 57: "11101101000", 58: "11101100010", 59: "11100011010",
      60: "11101111010", 61: "11001000010", 62: "11110001010", 63: "10100110000", 64: "10100001100", 65: "10010110000",
      66: "10010000110", 67: "10000101100", 68: "10000100110", 69: "10110010000", 70: "10110000100", 71: "10011010000",
      72: "10011000010", 73: "10000110100", 74: "10000110010", 75: "11000010010", 76: "11001010000", 77: "11110111010",
      78: "11000010100", 79: "10001111010", 80: "10100111100", 81: "10010111100", 82: "10010011110", 83: "10111100100",
      84: "10011110100", 85: "10011110010", 86: "11110100100", 87: "11110010100", 88: "11110010010", 89: "11011011110",
      90: "11011110110", 91: "11110110110", 92: "10101111000", 93: "10100011110", 94: "10001011110", 95: "10111101000",
      96: "10111100010", 97: "11110101000", 98: "11110100010", 99: "10111011110", 100: "10111101110", 101: "11101011110",
      102: "11110101110", 103: "11010000100", 104: "11010010000", 105: "11010011100", 106: "11000111010"
    };
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
    ctx.fillStyle = "#000";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    //ctx.fillText(data, canvas.width / 2, 90);
  }

  // Zoom avec clic
  miniContainer.onclick = () => {
    drawBarcode(document.getElementById("barcodeZoom"), porte, 9);
    zoomOverlay.style.display = "flex";
  };

  // Fermer avec la croix
  zoomOverlay.querySelector("#closeZoom").onclick = () => {
    zoomOverlay.style.display = "none";
  };

  // Fermer avec "Échap"
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      zoomOverlay.style.display = "none";
    }
  });

  // Affichage miniature
  drawBarcode(document.getElementById("barcodeCanvas"), porte, 2);
})();

// Nombre de camion Jour/avance dans le parc

(function () {
  if (!window.location.pathname.includes("/Yardmanagement")) return;

  function mettreAJourCompteurs() {
    const verts = document.querySelectorAll('.trafficLightVorrauswareGreen').length;
    const jaunes = document.querySelectorAll('.trafficLightVorrauswareYellow').length;
    const rouges = document.querySelectorAll('.trafficLightVorrauswareRed').length;

    const titre = Array.from(document.querySelectorAll("h1, h2")).find(el => el.textContent.includes("Gestion du parc"));
    if (!titre) return;

    // Création du conteneur global
    let container = document.getElementById("filtrage-et-compteurs");
    if (!container) {
      container = document.createElement("div");
      container.id = "filtrage-et-compteurs";
      container.style.display = "flex";
      container.style.alignItems = "center";
      container.style.gap = "20px";
      container.style.marginTop = "10px";
      container.style.justifyContent = "center";
      container.style.position = "absolute";
      container.style.top = "50%";
      container.style.transform = "translateY(-50%)";
      container.style.left = "200px";
      container.style.zIndex = "9999";

      titre.parentElement.insertBefore(container, titre.nextSibling);
    }

    // Menu déroulant
    let select = document.getElementById("filtre-couleur");
    if (!select) {
      select = document.createElement("select");
      select.id = "filtre-couleur";
      select.style.fontSize = "18px";
      select.style.padding = "6px 12px";
      select.style.border = "1px solid #ccc";
      select.style.borderRadius = "10px";
      select.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      select.style.backgroundColor = "#f5f5f5";
      select.style.fontWeight = "bold";
      select.style.height = "42px";

      select.innerHTML = `
        <option value="all">Afficher tous</option>
        <option value="green">🟢 Aucune précommande</option>
        <option value="yellow">🟡 Partiel</option>
        <option value="red">🔴 Complet</option>
      `;

      // Réapplique la sélection précédente si disponible
      const savedFilter = localStorage.getItem("filtre-couleur");
      if (savedFilter) {
        select.value = savedFilter;
      }

      container.appendChild(select);

      select.addEventListener("change", () => {
        localStorage.setItem("filtre-couleur", select.value);
        appliquerFiltre(select.value);
      });
    }

    // Appliquer le filtre en cours (au rechargement par exemple)
    appliquerFiltre(select.value);

    // Compteurs
    let compteur = document.getElementById("compteurs-marchandises");
    if (!compteur) {
      compteur = document.createElement("span");
      compteur.id = "compteurs-marchandises";
      compteur.style.fontSize = "18px";
      compteur.style.padding = "6px 12px";
      compteur.style.border = "1px solid #ccc";
      compteur.style.borderRadius = "10px";
      compteur.style.background = "#fff";
      compteur.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
      container.appendChild(compteur);
    }

    compteur.innerHTML = `🟢 ${verts} &nbsp;&nbsp; 🟡 ${jaunes} &nbsp;&nbsp; 🔴 ${rouges}`;
  }

  function appliquerFiltre(value) {
    const rows = document.querySelectorAll("table tbody tr");
    rows.forEach(row => {
      const hasRed = row.querySelector(".trafficLightVorrauswareRed");
      const hasYellow = row.querySelector(".trafficLightVorrauswareYellow");
      const hasGreen = row.querySelector(".trafficLightVorrauswareGreen");

      row.style.display = "table-row"; // reset

      if (value === "green" && !hasGreen) row.style.display = "none";
      if (value === "yellow" && !hasYellow) row.style.display = "none";
      if (value === "red" && !hasRed) row.style.display = "none";
    });
  }

  // Lancement initial
  setTimeout(() => {
    mettreAJourCompteurs();
    setInterval(mettreAJourCompteurs, 10000); // toutes les 10s
  }, 1500);
})();



// Palette AB dans Gestion du parc

(function () {
  if (!window.location.pathname.includes("/Yardmanagement")) return;

  function getTomorrowFormatted() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yy = String(tomorrow.getFullYear()).slice(2);
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    return `${yy}${mm}${dd}`; // Format : YYMMDD
  }

  const klstbCible = getTomorrowFormatted();

  const lignes = document.querySelectorAll("table tbody tr");
  lignes.forEach(ligne => {
    const contenu = ligne.innerText;

    const estEM = contenu.includes("EM");
    const contientKLSTB = contenu.includes(klstbCible);

    if (estEM && contientKLSTB) {
      ligne.style.backgroundColor = "#fff9cc"; // Jaune pâle
      const badge = document.createElement("span");
      badge.textContent = "📦 AB";
      badge.style.marginLeft = "8px";
      badge.style.color = "#d18d00";
      badge.style.fontWeight = "bold";

      const premiereCellule = ligne.querySelector("td");
      if (premiereCellule) premiereCellule.appendChild(badge);
    }
  });
})();

// alerte statut 44

(function () {
  if (!window.location.href.includes("xdock")) return;

  let derniersEMStatuts = {};

  function afficherAlerte(emNumber, probleme, lien) {
    // Vérifie si une alerte est déjà présente
    if (document.getElementById(`alerte-${emNumber}`)) return;

    const alerte = document.createElement("div");
    alerte.id = `alerte-${emNumber}`;
    alerte.style.position = "fixed";
    alerte.style.bottom = "20px";
    alerte.style.right = "20px";
    alerte.style.zIndex = "9999";
    alerte.style.background = "rgba(128, 0, 128, 0.5)";
    alerte.style.padding = "15px 20px";
    alerte.style.borderRadius = "15px";
    alerte.style.color = "white";
    alerte.style.fontSize = "16px";
    alerte.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
    alerte.style.maxWidth = "300px";
    alerte.style.cursor = "pointer";
    alerte.innerHTML = `
      <strong>EM ${emNumber}</strong><br>${probleme}
      <span style="position: absolute; top: 5px; right: 10px; cursor: pointer; font-weight: bold;">✖</span>
    `;

    // Redirection au clic
    alerte.onclick = () => {
      window.location.href = lien;
    };

    // Crois de fermeture
    alerte.querySelector("span").onclick = (e) => {
      e.stopPropagation();
      alerte.remove();
    };

    document.body.appendChild(alerte);

    // Suppression auto après 10 secondes
    setTimeout(() => {
      alerte.remove();
    }, 10000);
  }

  function verifierEM() {
    const lignes = document.querySelectorAll("table tbody tr");

    lignes.forEach(row => {
      const emCell = row.querySelector("td:nth-child(2)");
      const statutCell = row.querySelector("td:nth-child(3)");

      if (!emCell || !statutCell) return;

      const emNumber = emCell.textContent.trim();
      const statut = parseInt(statutCell.textContent.trim());

      if (!emNumber || isNaN(statut)) return;

      // Vérifie un changement en 44
      if (statut === 44 && derniersEMStatuts[emNumber] !== 44) {
        const probleme = "Statut 44 détecté";
        const lien = `/Wareneingang/TourKlaerfaelle?WeTourId=${emNumber}`;
        afficherAlerte(emNumber, probleme, lien);
      }

      // Met à jour le statut
      derniersEMStatuts[emNumber] = statut;
    });
  }

  setInterval(verifierEM, 5000); // toutes les 5 secondes
})();
