const input = document.getElementById("input");
const output = document.getElementById("output");
const status = document.getElementById("status");

const sampleWindowsButton = document.getElementById("sampleWindows");
const sampleUrlButton = document.getElementById("sampleUrl");
const sampleEscapeButton = document.getElementById("sampleEscape");

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
}

function loadSampleWindows() {
  input.value = "C:\\Users\\Jacqueline\\Documents\\Project\\tree_asset.fbx";
  output.value = "";
  setStatus("Windowsパスのサンプルを入れました");
}

function loadSampleUrl() {
  input.value = "Assets/Textures/Foliage/leaf_albedo.png";
  output.value = "";
  setStatus("スラッシュ区切りのサンプルを入れました");
}

function loadSampleEscape() {
  input.value = "folder/subfolder/file_name_v01.txt";
  output.value = "";
  setStatus("エスケープ変換向けサンプルを入れました");
}

sampleWindowsButton.addEventListener("click", loadSampleWindows);
sampleUrlButton.addEventListener("click", loadSampleUrl);
sampleEscapeButton.addEventListener("click", loadSampleEscape);

toBackslashButton.addEventListener("click", convertSlashToBackslash);
toDoubleBackslashButton.addEventListener("click", convertSlashToDoubleBackslash);
toSlashButton.addEventListener("click", convertBackslashToSlash);

copyOutputButton.addEventListener("click", copyOutput);
clearAllButton.addEventListener("click", clearAll);
