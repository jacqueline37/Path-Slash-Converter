const input = document.getElementById("input");
const output = document.getElementById("output");
const status = document.getElementById("status");

const swapSlashButton = document.getElementById("swapSlash");
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

function swapSlashes() {
  const source = input.value;
  const slashCount = countMatches(source, /\//g);
  const backslashCount = countMatches(source, /\\/g);
  const totalCount = slashCount + backslashCount;

  const tempToken = "__SLASH_SWAP_TEMP__";

  output.value = source
    .replace(/\\/g, tempToken)
    .replace(/\//g, "\\")
    .replace(new RegExp(tempToken, "g"), "/");

  setStatus("${totalCount}個の / と \\（¥）を変換しました");
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

swapSlashButton.addEventListener("click", swapSlashes);
copyOutputButton.addEventListener("click", copyOutput);
clearAllButton.addEventListener("click", clearAll);
