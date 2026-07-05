const input = document.getElementById("input");
const output = document.getElementById("output");
const status = document.getElementById("status");

const title = document.getElementById("title");
const description = document.getElementById("description");
const inputLabel = document.getElementById("inputLabel");
const outputLabel = document.getElementById("outputLabel");

const swapSlashButton = document.getElementById("swapSlash");
const copyOutputButton = document.getElementById("copyOutput");
const clearAllButton = document.getElementById("clearAll");

const langJaButton = document.getElementById("langJa");
const langEnButton = document.getElementById("langEn");

const lang = {
  ja: {
    title: "Path Slash Converter",
    desc: "パス内の / と \\（¥ / ￥ / ＼）を相互変換するツール",
    input: "入力",
    output: "出力",
    copy: "コピー",
    clear: "クリア",
    converted: (c) => `${c}個変換しました`,
    copied: "コピーしました",
    cleared: "クリアしました",
    no: "コピーするものがありません"
  },
  en: {
    title: "Path Slash Converter",
    desc: "Convert / and \\ including ¥ / ￥ / ＼",
    input: "Input",
    output: "Output",
    copy: "Copy",
    clear: "Clear",
    converted: (c) => `Converted ${c}`,
    copied: "Copied",
    cleared: "Cleared",
    no: "Nothing to copy"
  }
};

function getLangFromURL() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("lang");
  return value === "ja" || value === "en" ? value : null;
}

function getInitialLang() {
  const urlLang = getLangFromURL();
  if (urlLang) return urlLang;
  const savedLang = localStorage.getItem("lang");
  if (savedLang === "ja" || savedLang === "en") return savedLang;
  return "ja";
}

let current = getInitialLang();

function updateURLLang(langCode) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", langCode);
  window.history.replaceState({}, "", url);
}

function setLang(langCode, updateURL = true) {
  current = langCode;
  localStorage.setItem("lang", langCode);
  if (updateURL) updateURLLang(langCode);

  const t = lang[langCode];
  document.documentElement.lang = langCode;
  title.textContent = t.title;
  description.textContent = t.desc;
  inputLabel.textContent = t.input;
  outputLabel.textContent = t.output;
  copyOutputButton.textContent = t.copy;
  clearAllButton.textContent = t.clear;

  langJaButton.disabled = langCode === "ja";
  langEnButton.disabled = langCode === "en";
}

function setStatus(message) {
  status.textContent = message;
  clearTimeout(setStatus.t);
  setStatus.t = setTimeout(() => {
    status.textContent = "";
  }, 2000);
}

function normalize(text) {
  return text.replace(/[¥￥＼]/g, "\\");
}

function swap() {
  const src = normalize(input.value);
  const slashCount = (src.match(/\//g) || []).length;
  const backslashCount = (src.match(/\\/g) || []).length;

  output.value = src.replace(/[\/\\]/g, (m) => (m === "/" ? "\\" : "/"));

  setStatus(lang[current].converted(slashCount + backslashCount));
}

async function copy() {
  if (!output.value) {
    setStatus(lang[current].no);
    return;
  }

  try {
    await navigator.clipboard.writeText(output.value);
    setStatus(lang[current].copied);
  } catch (error) {
    output.select();
    document.execCommand("copy");
    setStatus(lang[current].copied);
  }
}

function clearAll() {
  input.value = "";
  output.value = "";
  setStatus(lang[current].cleared);
}

swapSlashButton.onclick = swap;
copyOutputButton.onclick = copy;
clearAllButton.onclick = clearAll;

langJaButton.onclick = () => setLang("ja", true);
langEnButton.onclick = () => setLang("en", true);

setLang(current, true);
