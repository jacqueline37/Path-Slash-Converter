const input = document.getElementById("input");
const output = document.getElementById("output");
const status = document.getElementById("status");
const copyButton = document.getElementById("copyOutput");
const clearButton = document.getElementById("clearAll");
const langJaButton = document.getElementById("langJa");
const langEnButton = document.getElementById("langEn");
const targetRadios = document.querySelectorAll('input[name="target"]');

const strings = {
  ja: {
    docTitle: "Path Slash Converter | パスの / と \\ を揃える無料ツール",
    desc: "パス内の / と \\ を、どちらか一方に揃えます。¥・￥・＼ も \\ として扱います。",
    langGroup: "表示言語",
    input: "変換したいパス",
    clear: "クリア",
    direction: "揃える区切り文字",
    slash: "スラッシュ",
    backslash: "バックスラッシュ（¥）",
    output: "変換結果",
    empty: "ここに変換結果が表示されます",
    copy: "結果をコピー",
    changed: (n, g) => `${n}か所を ${g} にしました`,
    unchanged: "変える区切り文字はありません",
    copied: "コピーしました",
    copyFailed: "コピーできませんでした。結果を選択して手動でコピーしてください",
    nothingToCopy: "コピーする結果がありません。先にパスを入力してください",
    cleared: "クリアしました",
    privacy: "入力したパスはこのページの中だけで変換され、どこにも送信されません。https:// などの URL はそのまま残します。"
  },
  en: {
    docTitle: "Path Slash Converter | Unify / and \\ in file paths",
    desc: "Make every separator in a path the same: all / or all \\. ¥, ￥ and ＼ count as \\.",
    langGroup: "Language",
    input: "Path to convert",
    clear: "Clear",
    direction: "Separator to use",
    slash: "Slash",
    backslash: "Backslash (¥)",
    output: "Result",
    empty: "The converted path appears here",
    copy: "Copy result",
    changed: (n, g) => `Changed ${n} separator${n === 1 ? "" : "s"} to ${g}`,
    unchanged: "No separators to change",
    copied: "Copied",
    copyFailed: "Couldn't copy. Select the result and copy it manually.",
    nothingToCopy: "Nothing to copy yet. Paste a path first.",
    cleared: "Cleared",
    privacy: "Paths are converted on this page and never sent anywhere. URLs such as https:// are left as they are."
  }
};

/* ---------- Storage (may be unavailable in private modes) ---------- */

function readStored(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    /* ignore: the page works without storage */
  }
}

/* ---------- Language ---------- */

const isLang = (value) => value === "ja" || value === "en";

function getInitialLang() {
  const fromURL = new URLSearchParams(window.location.search).get("lang");
  if (isLang(fromURL)) return fromURL;
  const saved = readStored("lang");
  return isLang(saved) ? saved : "ja";
}

let currentLang = getInitialLang();

function syncURL(langCode) {
  try {
    const url = new URL(window.location.href);
    if (langCode === "ja") {
      url.searchParams.delete("lang");
    } else {
      url.searchParams.set("lang", langCode);
    }
    window.history.replaceState(null, "", url);
  } catch (error) {
    /* ignore: e.g. pages opened from file:// in some browsers */
  }
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

// Many Japanese fonts draw "\" as "¥", so separators inside UI text are
// set in the path (Latin monospace) face to show the real glyph.
function setRichText(element, value) {
  const fragment = document.createDocumentFragment();
  for (const piece of value.split(/([\/\\])/)) {
    if (!piece) continue;
    if (piece === "/" || piece === "\\") {
      const span = document.createElement("span");
      span.className = "sep";
      span.textContent = piece;
      fragment.appendChild(span);
    } else {
      fragment.appendChild(document.createTextNode(piece));
    }
  }
  element.replaceChildren(fragment);
}

function applyLang(langCode) {
  currentLang = langCode;
  const t = strings[langCode];

  document.documentElement.lang = langCode;
  document.title = t.docTitle;
  setRichText(document.getElementById("description"), t.desc);
  setText("inputLabel", t.input);
  setText("directionLabel", t.direction);
  setText("slashText", t.slash);
  setText("backslashText", t.backslash);
  setText("outputLabel", t.output);
  setText("privacyNote", t.privacy);
  clearButton.textContent = t.clear;
  copyButton.textContent = t.copy;
  output.dataset.empty = t.empty;
  document.getElementById("langGroup").setAttribute("aria-label", t.langGroup);

  langJaButton.setAttribute("aria-pressed", String(langCode === "ja"));
  langEnButton.setAttribute("aria-pressed", String(langCode === "en"));

  showSummary();
}

function switchLang(langCode) {
  if (langCode === currentLang) return;
  writeStored("lang", langCode);
  syncURL(langCode);
  applyLang(langCode);
}

/* ---------- Conversion ---------- */

// Backslash look-alikes (yen signs, fullwidth backslash) and fullwidth slash.
const SEPARATOR = /[\/\\¥￥＼／]/;
// URLs like https://example.com/a are left untouched.
const URL_PATTERN = /[a-z][a-z0-9+.-]*:\/\/\S*/gi;

function getTarget() {
  const checked = document.querySelector('input[name="target"]:checked');
  return checked ? checked.value : "/";
}

function setTarget(value) {
  targetRadios.forEach((radio) => {
    radio.checked = radio.value === value;
  });
}

/** Returns { text, parts: [{ text, changed }], count } */
function convert(source, target) {
  const parts = [];
  let text = "";
  let count = 0;
  let plain = "";

  const flushPlain = () => {
    if (plain) {
      parts.push({ text: plain, changed: false });
      plain = "";
    }
  };

  const convertSegment = (segment) => {
    for (const ch of segment) {
      if (SEPARATOR.test(ch)) {
        if (ch !== target) {
          flushPlain();
          parts.push({ text: target, changed: true });
          count += 1;
        } else {
          plain += ch;
        }
        text += target;
      } else {
        plain += ch;
        text += ch;
      }
    }
  };

  let last = 0;
  for (const match of source.matchAll(URL_PATTERN)) {
    convertSegment(source.slice(last, match.index));
    plain += match[0];
    text += match[0];
    last = match.index + match[0].length;
  }
  convertSegment(source.slice(last));
  flushPlain();

  return { text, parts, count };
}

/** The separator the input mostly uses, so we can default to the other one. */
function dominantSeparator(source) {
  const withoutURLs = source.replace(URL_PATTERN, "");
  const slashes = (withoutURLs.match(/[\/／]/g) || []).length;
  const backslashes = (withoutURLs.match(/[\\¥￥＼]/g) || []).length;
  if (slashes === backslashes) return null;
  return slashes > backslashes ? "/" : "\\";
}

let result = { text: "", parts: [], count: 0 };
let userPickedTarget = false;

function render(animate) {
  result = convert(input.value, getTarget());

  const fragment = document.createDocumentFragment();
  for (const part of result.parts) {
    if (part.changed) {
      const mark = document.createElement("mark");
      mark.textContent = part.text;
      fragment.appendChild(mark);
    } else {
      fragment.appendChild(document.createTextNode(part.text));
    }
  }
  output.replaceChildren(fragment);

  output.classList.remove("just-changed");
  if (animate && result.count > 0) {
    void output.offsetWidth; // restart the animation
    output.classList.add("just-changed");
  }
}

/* ---------- Status ---------- */

let statusTimer;

function showSummary() {
  clearTimeout(statusTimer);
  const t = strings[currentLang];
  if (!input.value.trim()) {
    status.textContent = "";
  } else if (result.count > 0) {
    setRichText(status, t.changed(result.count, getTarget()));
  } else {
    status.textContent = t.unchanged;
  }
}

function showMessage(message) {
  clearTimeout(statusTimer);
  setRichText(status, message);
  statusTimer = setTimeout(showSummary, 2500);
}

/* ---------- Actions ---------- */

let summaryDebounce;

function handleInput(event) {
  if (!input.value.trim()) {
    userPickedTarget = false;
  } else if (!userPickedTarget) {
    const dominant = dominantSeparator(input.value);
    if (dominant) setTarget(dominant === "/" ? "\\" : "/");
  }

  const pasted = event && event.inputType === "insertFromPaste";
  render(pasted);

  // Announce the count once typing pauses, not on every keystroke.
  clearTimeout(summaryDebounce);
  if (pasted) {
    showSummary();
  } else {
    summaryDebounce = setTimeout(showSummary, 600);
  }
}

function handleTargetChange() {
  userPickedTarget = true;
  render(true);
  showSummary();
}

function copyWithSelection(text) {
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (error) {
    ok = false;
  }
  helper.remove();
  return ok;
}

async function copyResult() {
  const t = strings[currentLang];
  if (!result.text) {
    showMessage(t.nothingToCopy);
    input.focus();
    return;
  }

  let ok = false;
  try {
    await navigator.clipboard.writeText(result.text);
    ok = true;
  } catch (error) {
    ok = copyWithSelection(result.text);
  }
  showMessage(ok ? t.copied : t.copyFailed);
}

function clearAll() {
  input.value = "";
  userPickedTarget = false;
  render(false);
  showMessage(strings[currentLang].cleared);
  input.focus();
}

/* ---------- Wire up ---------- */

input.addEventListener("input", handleInput);
targetRadios.forEach((radio) => radio.addEventListener("change", handleTargetChange));
copyButton.addEventListener("click", copyResult);
clearButton.addEventListener("click", clearAll);
langJaButton.addEventListener("click", () => switchLang("ja"));
langEnButton.addEventListener("click", () => switchLang("en"));

// Ctrl/Cmd + Enter in the input copies the result.
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    copyResult();
  }
});

render(false);
applyLang(currentLang);
if (currentLang !== "ja") syncURL(currentLang);
