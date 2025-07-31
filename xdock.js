console.log("✅ Script xdock.js chargé");

(function () {
  if (!location.href.includes("LkwUebersicht")) return;

  const lignes = document.querySelectorAll("tbody tr");
  lignes.forEach((ligne) => {
    const celluleTel = ligne.querySelector("td:nth-child(4)");
    if (celluleTel && !celluleTel.querySelector("a")) {
      const texte = celluleTel.innerText.trim();
      if (texte.startsWith("+33")) {
        const lien = document.createElement("a");
        lien.href = "tel:" + texte.replace(/\s+/g, "");
        lien.textContent = " 📞";
        lien.style.color = "blue";
        lien.style.fontWeight = "bold";
        celluleTel.appendChild(lien);
      }
    }
  });
})();
