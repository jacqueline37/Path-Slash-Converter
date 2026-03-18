const input = document.getElementById("input");
const output = document.getElementById("output");
const status = document.getElementById("status");

function setStatus(message) {
  status.textContent = message;

  if (!message) return;

  clearTimeout(setStatus.timer);
  setStatus.timer = setTimeout(() => {
    status.textContent = "";
  }, 1800);
}

function convertToBackslash() {
  output.value = input.value.replace(/\//g, "\\");
}

function convertToSlash() {
  output.value = input.value.replace(/\\/g, "/");
}

function autoSwap() {
  const value = input.value;
  const slashCount = (value.match(/\//g) || []).length;
  const backslashCount = (value.match(/\\/g) || []).length;

  if (slashCount === 0 && backslashCount === 0) {
    output.value = value;
    return;
  }

  if (backslashCount >= slashCount) {
    convertToSlash();
  } else {
    convertToBackslash();
  }
}

async function copyOutput() {
  if (!output.value) {
    setStatus("コピーする結果がありません");
    return;
  }

  try {
    await navigator.clipboard.writeText(output.value);
    setStatus("コピーしました");
  } catch (error) {
    output.select();
    document.execCommand("copy");
    setStatus("コピーしました");
  }
}

function clearAll() {
  input.value = "";
  output.value = "";
  setStatus("クリアしました");
}

document.getElementById("toBackslash").addEventListener("click", convertToBackslash);
document.getElementById("toSlash").addEventListener("click", convertToSlash);
document.getElementById("swapBoth").addEventListener("click", autoSwap);
document.getElementById("copyOutput").addEventListener("click", copyOutput);
document.getElementById("clearAll").addEventListener("click", clearAll);

input.addEventListener("input", autoSwap);