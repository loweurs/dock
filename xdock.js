(function () {
  'use strict';

  const destinations = {
    "Alcalá": "alc", "Beaucaire": "bea", "Vitoria": "vit", "Palmela": "palm", "Valencia": "vlc", "Ablis": "abl",
    "Arcs-sur-Argens": "asa", "Barbery": "barb", "Barcelona": "bcn", "Baziège": "baz", "Béziers": "bez",
    "Carquefou": "caq", "Cestas": "cet", "Chanteloup-Les-Vignes": "clv", "Entzheim": "ent", "Gondreville": "gon",
    "Gran Canaria": "gca", "Granada": "grn", "Honguemare-Guenouville": "hon", "La Chapelle D'Armentières": "lca",
    "Le Coudray-Montceaux": "lcm", "Liffré": "lif", "Loures": "lou", "Málaga": "mlg", "Martorell": "mat",
    "Meaux": "mea", "Montchanin": "mon", "Montoy Flanville": "mfv", "Murcia": "mur", "Narón": "nar",
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
        lien.style.color = '#0000EE';
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
