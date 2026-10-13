const DEBUT_COUPLE = "2024-01-01";
const FILMS = [
  {
    titre: "Blanche-Neige et les Sept Nains",
    annee: 1937,
    vuLe: "",
    lieu: "",
    souvenir: "",
  },
  {
    titre: "Pinocchio",
    annee: 1940,
    vuLe: "",
    lieu: "",
    souvenir: "",
  },
  {
    titre: "Fantasia",
    annee: 1940,
    vuLe: "",
    lieu: "",
    souvenir: "",
  },
];

// ============================================================
// Code (pas besoin d'y toucher pour ajouter des films)
// ============================================================

const IMG_BASE = "https://image.tmdb.org/t/p/w500";

function el(tag, classe, texte) {
  const noeud = document.createElement(tag);
  if (classe) noeud.className = classe;
  if (texte) noeud.textContent = texte;
  return noeud;
}

function formaterDate(iso) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
    new Date(`${iso}T12:00:00`),
  );
}

// "Cela fait 412 jours qu'on écrit notre histoire."
function afficherDuree() {
  const cible = document.getElementById("duree");
  if (!cible) return;

  const debut = new Date(`${DEBUT_COUPLE}T00:00:00`);
  const jours = Math.floor((Date.now() - debut.getTime()) / 86400000);
  if (Number.isNaN(jours) || jours < 0) return;

  cible.textContent = `${jours.toLocaleString("fr-FR")} ${
    jours > 1 ? "jours" : "jour"
  }`;
}

async function trouverAffiche(film) {
  if (film.affiche) return film.affiche;

  const cle = typeof TMDB_API_KEY === "undefined" ? "" : TMDB_API_KEY;
  if (!cle || cle === "VOTRE_CLE_API") return null;

  const params = new URLSearchParams({
    api_key: cle,
    query: film.titre,
    year: film.annee,
    language: "fr-FR",
  });

  try {
    const reponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?${params}`,
    );
    if (!reponse.ok) throw new Error(`TMDB a répondu ${reponse.status}`);
    const { results } = await reponse.json();
    const chemin = results?.[0]?.poster_path;
    return chemin ? `${IMG_BASE}${chemin}` : null;
  } catch (erreur) {
    console.warn(`Affiche introuvable pour « ${film.titre} » :`, erreur);
    return null;
  }
}

function afficherSansAffiche(figure, titre) {
  figure.replaceChildren(el("span", "", titre));
  figure.classList.add("affiche--vide");
}

function creerAffiche(film, url) {
  const figure = el("figure", "affiche");

  if (!url) {
    afficherSansAffiche(figure, film.titre);
    return figure;
  }

  const img = new Image();
  img.alt = `Affiche de ${film.titre}`;
  img.loading = "lazy";
  img.addEventListener("load", () => img.classList.add("est-charge"));
  img.addEventListener("error", () => afficherSansAffiche(figure, film.titre));
  img.src = url;
  figure.append(img);
  return figure;
}

function creerTexte(film) {
  const texte = el("div", "film-texte");
  texte.append(el("h3", "", film.titre));
  texte.append(el("p", "film-annee", `Sorti en ${film.annee}`));

  if (film.vuLe || film.lieu) {
    const infos = el("dl");
    if (film.vuLe) {
      infos.append(
        el("dt", "", "Vu le"),
        el("dd", "", formaterDate(film.vuLe)),
      );
    }
    if (film.lieu) {
      infos.append(el("dt", "", "Où"), el("dd", "", film.lieu));
    }
    texte.append(infos);
  }

  const souvenir = el(
    "blockquote",
    film.souvenir ? "" : "vide",
    film.souvenir ||
      "Pas encore de souvenir pour ce film. Ajoutez-le dans le champ « souvenir » de js/main.js.",
  );
  texte.append(souvenir);
  return texte;
}

async function afficherFilms() {
  const liste = document.getElementById("liste-films");
  if (!liste) return;

  const affiches = await Promise.all(FILMS.map(trouverAffiche));

  FILMS.forEach((film, i) => {
    const item = el("li", "film");
    item.append(creerAffiche(film, affiches[i]), creerTexte(film));
    liste.append(item);
  });
}

afficherDuree();
afficherFilms();
