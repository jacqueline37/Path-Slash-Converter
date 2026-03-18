const input = document.getElementById("input");
const output = document.getElementById("output");
const status = document.getElementById("status");

const toBackslashButton = document.getElementById("toBackslash");
const toDoubleBackslashButton = document.getElementById("toDoubleBackslash");
const toSlashButton = document.getElementById("toSlash");
const copyOutputButton = document.getElementById("copyOutput");
const clearAllButton = document.getElementById("clearAll");

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

function convertSlashToBackslash() {
  const source = input.value;
  const count = countMatches(source, /\//g);
  output.value = source.replace(/\//g, "\\");
  setStatus(`${count}個の / を \\ に変換しました`);
}

function convertSlashToDoubleBackslash() {
  const source = input.value;
  const count = countMatches(source, /\//g);
  output.value = source.replace(/\//g, "\\\\");
  setStatus(`${count}個の / を \\\\ に変換しました`);
}

function convertBackslashToSlash() {
  const source = input.value;
  const count = countMatches(source, /\\/g);
  output.value = source.replace(/\\/g, "/");
  setStatus(`${count}個の \\ を / に変換しました`);
}

async function copyOutput() {
  if (!output.value) {
    setStatus("コピーする結果がありません");
    return;
  }

  try {
    await navigator.clipboard.writeText(output.value);
    setStatus("出力結果をコピーしました");
  } catch (error) {
    output.select();
    document.execCommand("copy");
    setStatus("出力結果をコピーしました");
  }
}

function clearAll() {
  input.value = "";
  output.value = "";
  setStatus("クリアしました");
  input.focus();
}

toBackslashButton.addEventListener("click", convertSlashToBackslash);
toDoubleBackslashButton.addEventListener("click", convertSlashToDoubleBackslash);
toSlashButton.addEventListener("click", convertBackslashToSlash);
copyOutputButton.addEventListener("click", copyOutput);
clearAllButton.addEventListener("click", clearAll);
