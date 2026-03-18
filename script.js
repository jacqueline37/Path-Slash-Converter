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

const i18n = {
  ja: {
    title: "Path Slash Converter",
    description: "パス内の / と \\（¥ / ￥ / ＼）を相互変換するツール",
    inputLabel: "入力",
    outputLabel: "出力",
    inputPlaceholder: "例: C:\\Users\\YourName\\Documents\\project\\file.txt",
    outputPlaceholder: "変換結果がここに表示されます",
    swapButton: "/ ⇄ \\ (¥)",
    copyButton: "コピー",
    clearButton: "クリア",
    copied: "出力結果をコピーしました",
    noOutput: "コピーする結果がありません",
    cleared: "クリアしました",
    converted: (count) => `${count}個の / と \\（¥ / ￥ / ＼ 含む）を変換しました`
  },
  en: {
    title: "Path Slash Converter",
    description: "Convert / and \\ in path strings, including ¥ / ￥ / ＼.",
    inputLabel: "Input",
    outputLabel: "Output",
    inputPlaceholder: "Example: C:\\Users\\YourName\\Documents\\project\\file.txt",
    outputPlaceholder: "Converted result will appear here",
    swapButton: "/ ⇄ \\ (¥)",
    copyButton: "Copy",
    clearButton: "Clear",
    copied: "Copied the output",
    noOutput: "There is no output to copy",
    cleared: "Cleared",
    converted: (count) => `Converted ${count} slash characters`
  }
};

let currentLang = localStorage.getItem("psc_lang") || "ja";

function getText() {
  return i18n[currentLang];
}

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("psc_lang", lang);

  const t = getText();

  document.documentElement.lang = lang;
  title.textContent = t.title;
  description.textContent = t.description;
  inputLabel.textContent = t.inputLabel;
  outputLabel.textContent = t.outputLabel;
  input.placeholder = t.inputPlaceholder;
  output.placeholder = t.outputPlaceholder;
  swapSlashButton.textContent = t.swapButton;
  copyOutputButton.textContent = t.copyButton;
  clearAllButton.textContent = t.clearButton;

  langJaButton.disabled = lang === "ja";
  langEnButton.disabled = lang === "en";
}

function setStatus(message) {
  status.textContent = message;

  clearTimeout(setStatus.timer);
  if (!message) return;

  setStatus.timer = setTimeout(() => {
    status.textContent = "";
  }, 2200);
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function normalizeSlashLikeChars(text) {
  return text.replace(/[¥￥＼]/g, "\\");
}

function swapSlashes() {
  const source = normalizeSlashLikeChars(input.value);

  const slashCount = countMatches(source, /\//g);
  const backslashCount = countMatches(source, /\\/g);
  const totalCount = slashCount + backslashCount;

  const tempToken = "__SLASH_SWAP_TEMP__";

  output.value = source
    .replace(/\\/g, tempToken)
    .replace(/\//g, "\\")
    .replace(new RegExp(tempToken, "g"), "/");

  setStatus(getText().converted(totalCount));
}

async function copyOutput() {
  if (!output.value) {
    setStatus(getText().noOutput);
    return;
  }

  try {
    await navigator.clipboard.writeText(output.value);
    setStatus(getText().copied);
  } catch (error) {
    output.select();
    document.execCommand("copy");
    setStatus(getText().copied);
  }
}

function clearAll() {
  input.value = "";
  output.value = "";
  setStatus(getText().cleared);
  input.focus();
}

swapSlashButton.addEventListener("click", swapSlashes);
copyOutputButton.addEventListener("click", copyOutput);
clearAllButton.addEventListener("click", clearAll);

langJaButton.addEventListener("click", () => applyLanguage("ja"));
langEnButton.addEventListener("click", () => applyLanguage("en"));

applyLanguage(currentLang);
