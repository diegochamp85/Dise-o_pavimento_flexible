const DEFAULTS = {
  w18: 13120941,
  reliability: 0.9,
  so: 0.45,
  mrMethod: "CBR",
  cbr: 7,
  mrDirect: 15000,
  po: 4.2,
  pt: 2.5,
  a1: 0.44,
  a2: 0.28,
  a3: 0.11,
  m2: 1,
  m3: 0.8,
  alternatives: [
    { d1: 4, d2: 6, d3: 6 },
    { d1: 4, d2: 8, d3: 6 },
    { d1: 4, d2: 10, d3: 6 },
    { d1: 4, d2: 12, d3: 6 },
    { d1: 4, d2: 14, d3: 6 },
    { d1: 5, d2: 6, d3: 6 },
    { d1: 5, d2: 8, d3: 6 },
    { d1: 5, d2: 10, d3: 6 },
    { d1: 5, d2: 12, d3: 6 },
    { d1: 5, d2: 14, d3: 6 },
  ],
};

const refs = {
  reliability: [
    [0.5, 0, "Mínimo, vías locales"],
    [0.6, -0.253, "Bajo, caminos rurales"],
    [0.7, -0.524, "Bajo-medio"],
    [0.75, -0.674, "Medio, secundarias"],
    [0.8, -0.841, "Medio-alto"],
    [0.85, -1.037, "Alto, principales"],
    [0.9, -1.282, "Alto, autopistas"],
    [0.95, -1.645, "Muy alto"],
    [0.99, -2.327, "Máximo"],
    [0.999, -3.09, "Excepcional"],
  ],
  po: [
    [4.5, "Autopistas / excelente"],
    [4.2, "Carreteras principales"],
    [4.0, "Carreteras secundarias"],
    [3.8, "Caminos locales"],
    [3.5, "Vías menores"],
  ],
  pt: [
    [3.0, "Muy conservador"],
    [2.5, "Autopistas"],
    [2.25, "Carreteras principales"],
    [2.0, "Carreteras secundarias"],
    [1.75, "Caminos locales"],
    [1.5, "Vías menores"],
    [1.0, "Mínimo"],
  ],
  a1: [
    [0.44, "Mezcla asfáltica densa, alta calidad"],
    [0.42, "Mezcla asfáltica densa, estándar"],
    [0.4, "Mezcla asfáltica densa, moderada"],
    [0.35, "Mezcla asfáltica arena-asfalto"],
    [0.34, "Base asfáltica, alta estabilidad"],
    [0.3, "Tratamiento superficial"],
    [0.28, "Base asfáltica moderada"],
    [0.2, "Otros"],
  ],
  a2: [
    [0.28, "Tratada con asfalto"],
    [0.2, "Tratada con cemento"],
    [0.15, "Estabilizada con cal"],
    [0.14, "Granular CBR >= 100%"],
    [0.13, "Granular CBR 80-100%"],
    [0.12, "Granular CBR 60-80%"],
    [0.11, "Granular CBR 40-60%"],
    [0.1, "Otros"],
  ],
  a3: [
    [0.14, "Tratada con cemento"],
    [0.11, "Granular CBR >= 40%"],
    [0.1, "Granular CBR 30-40%"],
    [0.09, "Granular CBR 20-30%"],
    [0.08, "Arena gruesa"],
    [0.07, "Arena fina"],
    [0.06, "Otros"],
  ],
  drainage: [
    [1.4, "Excelente, <1% saturado"],
    [1.35, "Excelente / bueno"],
    [1.3, "Excelente, 5-25%"],
    [1.25, "Regular, <1%"],
    [1.2, "Excelente, >25%"],
    [1.15, "Bueno / regular / pobre"],
    [1.05, "Regular / pobre / muy pobre"],
    [1.0, "Bueno, >25%"],
    [0.95, "Muy pobre, 1-5%"],
    [0.8, "Regular / pobre, >25%"],
    [0.75, "Muy pobre, 5-25%"],
    [0.6, "Pobre, >25%"],
    [0.4, "Muy pobre, >25%"],
    [0, "Sin drenaje"],
  ],
};

let state = structuredClone(DEFAULTS);

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 });
const fmt0 = new Intl.NumberFormat("es-EC", { maximumFractionDigits: 0 });

function optionLabel(value, description, suffix = "") {
  const shown = Number.isInteger(value) ? value.toFixed(0) : String(value);
  return `${shown}${suffix} - ${description}`;
}

function populateSelect(id, list, selected, suffix = "") {
  const select = $(id);
  select.innerHTML = "";
  list.forEach(([value, description]) => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = optionLabel(value, description, suffix);
    if (Number(value) === Number(selected)) option.selected = true;
    select.appendChild(option);
  });
}

function populateReliability() {
  const select = $("reliability");
  select.innerHTML = "";
  refs.reliability.forEach(([value, zr, description]) => {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = `${Math.round(value * 1000) / 10}% | ZR ${zr} - ${description}`;
    if (Number(value) === Number(state.reliability)) option.selected = true;
    select.appendChild(option);
  });
}

function initializeForm() {
  $("w18").value = state.w18;
  $("so").value = state.so;
  $("mrMethod").value = state.mrMethod;
  $("cbr").value = state.cbr;
  $("mrDirect").value = state.mrDirect;
  populateReliability();
  populateSelect("po", refs.po, state.po);
  populateSelect("pt", refs.pt, state.pt);
  populateSelect("a1", refs.a1, state.a1);
  populateSelect("a2", refs.a2, state.a2);
  populateSelect("a3", refs.a3, state.a3);
  populateSelect("m2", refs.drainage, state.m2);
  populateSelect("m3", refs.drainage, state.m3);
  renderAlternativeInputs();
  renderReferences();
}

function getZr(reliability) {
  const found = refs.reliability.find(([value]) => Number(value) === Number(reliability));
  return found ? found[1] : -1.282;
}

function getMr(inputs) {
  if (inputs.mrMethod === "Directo") return inputs.mrDirect;
  if (inputs.cbr <= 10) return 1500 * inputs.cbr;
  return 3000 * Math.pow(inputs.cbr, 0.65);
}

function classifyCbr(cbr) {
  if (cbr < 3) return "Muy débil";
  if (cbr < 6) return "Débil";
  if (cbr < 10) return "Moderado";
  if (cbr < 15) return "Bueno";
  if (cbr < 25) return "Muy bueno";
  return "Excelente";
}

function calculateSn(inputs) {
  const mr = getMr(inputs);
  const deltaPsi = inputs.po - inputs.pt;
  const zr = getZr(inputs.reliability);
  if (inputs.w18 <= 0 || mr <= 0 || deltaPsi <= 0) {
    return { sn: NaN, iterations: [], mr, zr, deltaPsi, w18Check: NaN };
  }

  const logW18 = Math.log10(inputs.w18);
  const logDelta = Math.log10(deltaPsi / 2.7);
  const logMr = Math.log10(mr);
  let sn = Math.pow(10, (logW18 - zr * inputs.so - 2.32 * logMr + 8.07 + 0.2) / 9.36) - 1;
  const iterations = [sn];

  for (let i = 0; i < 9; i += 1) {
    sn = Math.pow(
      10,
      (logW18 - zr * inputs.so - 2.32 * logMr + 8.07 + 0.2 - logDelta / (0.4 + 1094 / Math.pow(sn + 1, 5.19))) / 9.36
    ) - 1;
    iterations.push(sn);
  }

  const snRounded = Math.round(sn * 100) / 100;
  const w18Check = Math.pow(
    10,
    zr * inputs.so +
      9.36 * Math.log10(snRounded + 1) -
      0.2 +
      logDelta / (0.4 + 1094 / Math.pow(snRounded + 1, 5.19)) +
      2.32 * logMr -
      8.07
  );

  return { sn: snRounded, iterations, mr, zr, deltaPsi, w18Check };
}

function readInputs() {
  return {
    w18: Number($("w18").value),
    reliability: Number($("reliability").value),
    so: Number($("so").value),
    mrMethod: $("mrMethod").value,
    cbr: Number($("cbr").value),
    mrDirect: Number($("mrDirect").value),
    po: Number($("po").value),
    pt: Number($("pt").value),
    a1: Number($("a1").value),
    a2: Number($("a2").value),
    a3: Number($("a3").value),
    m2: Number($("m2").value),
    m3: Number($("m3").value),
    alternatives: state.alternatives,
  };
}

function evaluateAlternatives(inputs, snRequired) {
  return inputs.alternatives.map((alt, index) => {
    const sn1 = inputs.a1 * alt.d1;
    const sn2 = inputs.a2 * alt.d2 * inputs.m2;
    const sn3 = inputs.a3 * alt.d3 * inputs.m3;
    const snTotal = sn1 + sn2 + sn3;
    const diff = snTotal - snRequired;
    return {
      index: index + 1,
      ...alt,
      sn1,
      sn2,
      sn3,
      snTotal,
      diff,
      pass: snTotal >= snRequired,
      thickness: alt.d1 + alt.d2 + alt.d3,
    };
  });
}

function findBest(alternatives) {
  const passing = alternatives.filter((alt) => alt.pass);
  if (!passing.length) return null;
  return passing.reduce((best, alt) => (alt.diff < best.diff ? alt : best), passing[0]);
}

function renderAlternativeInputs() {
  const head = $("altHead");
  const body = $("altBody");
  head.innerHTML = "";
  body.innerHTML = "";

  const headerRow = document.createElement("tr");
  ["Parámetro", ...state.alternatives.map((_, i) => `Alt ${i + 1}`)].forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });
  head.appendChild(headerRow);

  ["d1", "d2", "d3"].forEach((key) => {
    const row = document.createElement("tr");
    const label = document.createElement("td");
    label.textContent = key === "d1" ? "D1 capa asfáltica, pulg" : key === "d2" ? "D2 base, pulg" : "D3 subbase, pulg";
    row.appendChild(label);
    state.alternatives.forEach((alt, index) => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.step = "0.5";
      input.value = alt[key];
      input.dataset.altIndex = index;
      input.dataset.layer = key;
      input.setAttribute("aria-label", `${label.textContent} alternativa ${index + 1}`);
      td.appendChild(input);
      row.appendChild(td);
    });
    body.appendChild(row);
  });

  ["sn1", "sn2", "sn3", "snTotal", "snRequired", "diff", "pass"].forEach((key) => {
    const row = document.createElement("tr");
    row.dataset.calcRow = key;
    const label = document.createElement("td");
    label.textContent =
      key === "sn1"
        ? "SN1"
        : key === "sn2"
          ? "SN2"
          : key === "sn3"
            ? "SN3"
            : key === "snTotal"
              ? "SN total"
              : key === "snRequired"
                ? "SN requerido"
                : key === "diff"
                  ? "Diferencia"
                  : "Cumple";
    row.appendChild(label);
    state.alternatives.forEach(() => {
      const td = document.createElement("td");
      row.appendChild(td);
    });
    body.appendChild(row);
  });
}

function renderAlternativeResults(alternatives, snRequired, best) {
  const rows = document.querySelectorAll("[data-calc-row]");
  rows.forEach((row) => {
    const key = row.dataset.calcRow;
    [...row.children].slice(1).forEach((td, index) => {
      const alt = alternatives[index];
      td.classList.toggle("highlight-alt", Boolean(best && best.index === alt.index));
      if (key === "pass") {
        td.innerHTML = `<span class="status ${alt.pass ? "pass" : "fail"}">${alt.pass ? "Si" : "No"}</span>`;
      } else if (key === "snRequired") {
        td.textContent = fmt.format(snRequired);
      } else if (key === "diff") {
        td.textContent = fmt.format(alt.diff);
        td.className = alt.diff >= 0 ? "diff-positive" : "diff-negative";
        if (best && best.index === alt.index) td.classList.add("highlight-alt");
      } else {
        td.textContent = fmt.format(alt[key]);
      }
    });
  });
}

function updateDiagram(best) {
  const target = best || { index: "-", d1: 4, d2: 6, d3: 6, snTotal: 0 };
  const maxThickness = Math.max(target.d1 + target.d2 + target.d3, 1);
  $("sectionTitle").textContent = best ? `Alternativa ${best.index}` : "Sin alternativa válida";
  $("bestD1").textContent = `${fmt.format(target.d1)} pulg`;
  $("bestD2").textContent = `${fmt.format(target.d2)} pulg`;
  $("bestD3").textContent = `${fmt.format(target.d3)} pulg`;
  $("bestSn").textContent = best ? fmt.format(best.snTotal) : "-";
  $("layerAsphalt").style.height = `${Math.max(36, (target.d1 / maxThickness) * 190)}px`;
  $("layerBase").style.height = `${Math.max(36, (target.d2 / maxThickness) * 190)}px`;
  $("layerSubbase").style.height = `${Math.max(36, (target.d3 / maxThickness) * 190)}px`;
}

function updateVisibility() {
  const direct = $("mrMethod").value === "Directo";
  $("cbrField").classList.toggle("hidden", direct);
  $("mrDirectField").classList.toggle("hidden", !direct);
}

function update() {
  state = { ...state, ...readInputs() };
  updateVisibility();
  const result = calculateSn(state);
  const alternatives = evaluateAlternatives(state, result.sn);
  const best = findBest(alternatives);
  const passing = alternatives.filter((alt) => alt.pass).length;

  $("snRequired").textContent = Number.isFinite(result.sn) ? fmt.format(result.sn) : "Revise datos";
  $("w18Check").textContent = Number.isFinite(result.w18Check) ? `W18 verificado: ${fmt0.format(result.w18Check)}` : "No calculable";
  $("bestAlt").textContent = best ? `Alt ${best.index}` : "Ninguna";
  $("bestAltDetail").textContent = best
    ? `Exceso SN ${fmt.format(best.diff)} | ${fmt.format(best.thickness)} pulg`
    : "Aumente espesores o revise parámetros";
  $("passRate").textContent = `${Math.round((passing / alternatives.length) * 100)}%`;
  $("passCount").textContent = `${passing} de ${alternatives.length} alternativas`;
  $("mrResult").textContent = Number.isFinite(result.mr) ? `${fmt0.format(result.mr)} psi` : "No calculable";
  $("mrHint").textContent =
    state.mrMethod === "CBR"
      ? `${classifyCbr(state.cbr)} | ${state.cbr <= 10 ? "Mr=1500 x CBR" : "Mr=3000 x CBR^0.65"}`
      : "Valor ingresado directamente";

  renderAlternativeResults(alternatives, result.sn, best);
  updateDiagram(best);
}

function renderReferences() {
  const coef = $("coefRefs");
  const service = $("serviceRefs");
  coef.innerHTML = "";
  service.innerHTML = "";

  [
    ["a1 - Capa asfáltica", refs.a1],
    ["a2 - Base", refs.a2],
    ["a3 - Subbase", refs.a3],
    ["m - Drenaje", refs.drainage],
  ].forEach(([title, list]) => {
    const card = document.createElement("div");
    card.className = "ref-card";
    card.innerHTML = `<strong>${title}</strong>${list
      .map(([value, desc]) => `<span>${value}: ${desc}</span>`)
      .join("")}`;
    coef.appendChild(card);
  });

  [
    ["R - Confiabilidad", refs.reliability.map(([r, zr, d]) => [`${Math.round(r * 1000) / 10}% | ZR ${zr}`, d])],
    ["Po - Serviciabilidad inicial", refs.po],
    ["Pt - Serviciabilidad final", refs.pt],
    ["Mr - CBR", [[1, "Mr=1500 x CBR si CBR <= 10"], [11, "Mr=3000 x CBR^0.65 si CBR > 10"]]],
  ].forEach(([title, list]) => {
    const card = document.createElement("div");
    card.className = "ref-card";
    card.innerHTML = `<strong>${title}</strong>${list
      .map(([value, desc]) => `<span>${value}: ${desc}</span>`)
      .join("")}`;
    service.appendChild(card);
  });
}

function bindEvents() {
  $("inputForm").addEventListener("input", update);
  $("inputForm").addEventListener("change", update);
  $("altBody").addEventListener("input", (event) => {
    const target = event.target;
    if (!target.matches("input[data-alt-index]")) return;
    const index = Number(target.dataset.altIndex);
    const layer = target.dataset.layer;
    state.alternatives[index][layer] = Number(target.value);
    update();
  });
  $("resetBtn").addEventListener("click", () => {
    state = structuredClone(DEFAULTS);
    initializeForm();
    update();
  });
  $("printBtn").addEventListener("click", () => window.print());

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const reference = button.dataset.mode === "reference";
      $("tableView").classList.toggle("hidden", reference);
      $("referenceView").classList.toggle("hidden", !reference);
    });
  });
}

initializeForm();
bindEvents();
update();
