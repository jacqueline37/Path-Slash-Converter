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

ja:{
title:"Path Slash Converter",
desc:"パス内の / と \\（¥ / ￥ / ＼）を相互変換するツール",
input:"入力",
output:"出力",
copy:"コピー",
clear:"クリア",
converted:c=>`${c}個変換しました`,
copied:"コピーしました",
cleared:"クリアしました",
no:"コピーするものがありません"
},

en:{
title:"Path Slash Converter",
desc:"Convert / and \\ including ¥ / ￥ / ＼",
input:"Input",
output:"Output",
copy:"Copy",
clear:"Clear",
converted:c=>`Converted ${c}`,
copied:"Copied",
cleared:"Cleared",
no:"Nothing to copy"
}

}



let current = localStorage.getItem("lang") || "ja";



function setLang(l){

current=l;
localStorage.setItem("lang",l);

const t=lang[l];

title.textContent=t.title;
description.textContent=t.desc;

inputLabel.textContent=t.input;
outputLabel.textContent=t.output;

copyOutputButton.textContent=t.copy;
clearAllButton.textContent=t.clear;

langJaButton.disabled=l==="ja";
langEnButton.disabled=l==="en";

}



function setStatus(m){

status.textContent=m;

clearTimeout(setStatus.t);

setStatus.t=setTimeout(()=>{
status.textContent="";
},2000);

}



function normalize(s){

return s.replace(/[¥￥＼]/g,"\\");

}



function swap(){

const src=normalize(input.value);

const a=(src.match(/\//g)||[]).length;
const b=(src.match(/\\/g)||[]).length;

const temp="__tmp__";

output.value=

src
.replace(/\\/g,temp)
.replace(/\//g,"\\")
.replace(new RegExp(temp,"g"),"/");

setStatus(lang[current].converted(a+b));

}



async function copy(){

if(!output.value){

setStatus(lang[current].no);
return;

}

await navigator.clipboard.writeText(output.value);

setStatus(lang[current].copied);

}



function clearAll(){

input.value="";
output.value="";

setStatus(lang[current].cleared);

}



swapSlashButton.onclick=swap;
copyOutputButton.onclick=copy;
clearAllButton.onclick=clearAll;

langJaButton.onclick=()=>setLang("ja");
langEnButton.onclick=()=>setLang("en");

setLang(current);
