// 6 : 1 script tel, 2 destination, 3 code barre, 4 Nombre(s) de camoion jour/Avance dans le parc, 5 statut 44, 

// 1 script tel === Cisco Jabber pour la page EM/SM (champ Téléphone/Pager) ===

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

// 2 destination ===  Lien cliquable sur les destinations (Synthèse du camion uniquement) ===

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

// 3 code barre === Générateur de code-barres dynamique ===

(function () {
  if (!window.location.pathname.startsWith("/Warenausgang/")) return;

  // Supprimer anciens éléments s'ils existent
  document.getElementById("barcode-mini")?.remove();
  document.getElementById("barcode-zoom")?.remove();

  // Trouver le champ de la porte (sans confusion avec les transporteurs)
  const porteLabel = Array.from(document.querySelectorAll("label")).find(label =>
    label.textContent.includes("Porte") || label.textContent.includes("door")
  );

  const porteInput = porteLabel ? porteLabel.parentElement.querySelector("input") : null;
  const porte = porteInput ? porteInput.value.trim() : "T25";

  // Création du conteneur miniature
  const miniContainer = document.createElement("div");
  miniContainer.id = "barcode-mini";
  miniContainer.style.marginTop = "10px";
  miniContainer.style.background = "#fff";
  miniContainer.style.border = "1px solid #000";
  miniContainer.style.padding = "8px";
  miniContainer.style.width = "fit-content";
  miniContainer.style.cursor = "pointer";
  miniContainer.style.borderRadius = "10px";
  miniContainer.innerHTML = `<svg id="barcodeCanvas"></svg>`;

  // Ajout juste sous le champ porte (comme ton script)
  if (porteInput && porteInput.parentElement) {
    porteInput.parentElement.appendChild(miniContainer);
  }

  // Création de la vue zoom
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
      <svg id="barcodeZoom"></svg>
    </div>
  `;
  document.body.appendChild(zoomOverlay);

  // Affichage miniature
  JsBarcode("#barcodeCanvas", porte, {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: false,
  });

  // Affichage zoomé au clic
  miniContainer.onclick = () => {
    JsBarcode("#barcodeZoom", porte, {
      format: "CODE128",
      width: 4,
      height: 120,
      displayValue: true,
    });
    zoomOverlay.style.display = "flex";
  };

  // Fermeture zoom
  document.getElementById("closeZoom").onclick = () => {
    zoomOverlay.style.display = "none";
  };
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") zoomOverlay.style.display = "none";
  });
})();


// 4 Nombre(s) de camoion jour/Avance dans le parc //

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

// === 6 statut 44 ===

(function () {
  if (!window.location.pathname.includes("/Taskmanagement/TaskmanagementAmLager")) return;

  const messages = {
    40: "Camion non encore validé",
    41: "Camion arrivé trop tôt",
    42: "Camion en retard",
    44: "Mission modifiée ou tournée affectée"
  };

  let dernierStatuts = {};

  function afficherAlerte(emNumber, statut, lien) {
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
      <strong>EM ${emNumber}</strong><br>❌ ${messages[statut] || "Erreur inconnue"}
      <span style="position: absolute; top: 5px; right: 10px; cursor: pointer; font-weight: bold;">✖</span>
    `;

    alerte.onclick = () => {
      window.location.href = lien;
    };

    alerte.querySelector("span").onclick = (e) => {
      e.stopPropagation();
      alerte.remove();
    };

    document.body.appendChild(alerte);

    setTimeout(() => {
      alerte.remove();
    }, 10000);
  }

  function verifierStatuts() {
    const lignes = document.querySelectorAll("table tbody tr");

    lignes.forEach(row => {
      const emCell = row.querySelector("td:nth-child(2)");
      const statutCell = row.querySelector("td:nth-child(3)");

      if (!emCell || !statutCell) return;

      const emNumber = emCell.textContent.trim();
      const statut = parseInt(statutCell.textContent.trim());

      if (!emNumber || isNaN(statut)) return;
      if (![40, 41, 42, 44].includes(statut)) return;

      if (dernierStatuts[emNumber] !== statut) {
        const lien = `/Wareneingang/TourKlaerfaelle?WeTourId=${emNumber}`;
        afficherAlerte(emNumber, statut, lien);
      }

      dernierStatuts[emNumber] = statut;
    });
  }

  setInterval(verifierStatuts, 4000);
})();

