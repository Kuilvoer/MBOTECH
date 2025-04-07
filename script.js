
document.addEventListener("DOMContentLoaded", () => {
  let data = [];
  let sortAsc = true;

  const filters = {
    opleiding: document.getElementById("opleidingFilter"),
    technologie: document.getElementById("technologieFilter"),
    jaar: document.getElementById("jaarFilter"),
    sorteer: document.getElementById("sortCheckbox"),
    zoek: document.getElementById("zoekInput"),
    resultaten: document.getElementById("resultaten"),
    teller: document.getElementById("resultCount")
  };

  const kleuren = {
    "AR": "#27ae60", "VR": "#3498db", "AI": "#8e44ad", "IoT": "#f39c12", "XR": "#16a085"
  };

  fetch("alle_toepassingen_met_uitgebreide_beschrijvingen.json")
    .then(res => res.json())
    .then(json => {
      data = json;

      const opleidingen = [...new Set(data.map(d => d.opleiding.trim()))].sort();
      const technologieën = [...new Set(data.map(d => d.technologie.trim()))].sort();
      const jaren = [...new Set(data.map(d => d.jaar))].filter(Boolean).sort((a,b) => a-b);

      opleidingen.forEach(o => filters.opleiding.innerHTML += `<option>${o}</option>`);
      technologieën.forEach(t => filters.technologie.innerHTML += `<option>${t}</option>`);
      jaren.forEach(j => filters.jaar.innerHTML += `<option>${j}</option>`);

      render();
    });

  function highlight(text, query) {
    if (!query) return text;
    const re = new RegExp(`(${query})`, "gi");
    return text.replace(re, '<span class="highlight">$1</span>');
  }

  function render() {
    const o = filters.opleiding.value;
    const t = filters.technologie.value;
    const j = filters.jaar.value;
    const zoek = filters.zoek.value.toLowerCase();

    let results = data.filter(d =>
      (!o || d.opleiding.trim() === o) &&
      (!t || d.technologie.trim() === t) &&
      (!j || d.jaar == j) &&
      (d.titel.toLowerCase().includes(zoek) || d.beschrijving.toLowerCase().includes(zoek))
    );

    results.sort((a, b) => filters.sorteer.checked ? a.jaar - b.jaar : 0);

    filters.resultaten.innerHTML = "";
    filters.teller.textContent = `${results.length} resultaten gevonden`;

    results.forEach(item => {
      const code = item.technologie.match(/\((.*?)\)/)?.[1] || "";
      const kleur = kleuren[code] || "#ccc";
      const wrapper = document.createElement("div");
      wrapper.className = "entry";
      wrapper.setAttribute("data-tech", code);

      wrapper.innerHTML = `
        <details>
          <summary>
            <span class="badge" style="background:${kleur}">${code}</span> 
            ${highlight(item.titel, zoek)} (${item.jaar || "?"})
          </summary>
          <p><strong>Opleiding:</strong> ${item.opleiding}</p>
          <p><strong>Technologie:</strong> ${item.technologie}</p>
          <p>${highlight(item.beschrijving, zoek)}</p>
        </details>
      `;
      filters.resultaten.appendChild(wrapper);
    });
  }

  filters.opleiding.addEventListener("change", render);
  filters.technologie.addEventListener("change", render);
  filters.jaar.addEventListener("change", render);
  filters.sorteer.addEventListener("change", render);
  filters.zoek.addEventListener("input", render);

  document.getElementById("toggleTheme").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
});

function resetFilters() {
  document.getElementById("opleidingFilter").value = "";
  document.getElementById("technologieFilter").value = "";
  document.getElementById("jaarFilter").value = "";
  document.getElementById("zoekInput").value = "";
  document.getElementById("sortCheckbox").checked = true;
  document.body.classList.remove("dark");
  document.dispatchEvent(new Event("DOMContentLoaded")); // reload filters
}
