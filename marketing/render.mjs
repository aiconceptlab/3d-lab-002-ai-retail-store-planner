import { readFile, writeFile, mkdir } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";

const out = new URL("./instagram-4x5/", import.meta.url);
await mkdir(out, { recursive: true });
const C = { bg:"#071b1b", panel:"#0d2926", ink:"#f7f4eb", muted:"#adc5bd", mint:"#54e3cf", orange:"#ff9a6f", line:"#31554d" };
const esc = (s) => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const t = (x,y,text,size=30,fill=C.ink,weight=400,extra="") => `<text x="${x}" y="${y}" fill="${fill}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="${weight}" ${extra}>${esc(text)}</text>`;
const lines = (x,y,list,size=30,fill=C.ink,weight=400,gap=size*1.18) => list.map((s,i)=>t(x,y+i*gap,s,size,fill,weight)).join("");
const rect = (x,y,w,h,fill,stroke="none",r=0,extra="") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const rule = (x,y,w) => `<path d="M${x} ${y}h${w}" stroke="${C.line}"/>`;
const image = async (file,x,y,w,h,fit="xMidYMid slice") => {
  const url = file.startsWith("../") ? new URL(file, import.meta.url) : new URL("./screenshots/"+file, import.meta.url);
  const bytes = await readFile(url);
  const type = file.endsWith(".png") ? "png" : "jpeg";
  return `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${fit}" href="data:image/${type};base64,${bytes.toString("base64")}"/>`;
};
const header = () => t(72,80,"AI CONCEPT LAB",18,C.ink,700,'letter-spacing="3"') + t(1008,80,"3D LAB // 002",18,C.mint,700,'text-anchor="end" letter-spacing="2"') + rule(72,108,936);
const footer = (i) => rule(72,1241,936) + t(72,1284,"AI RETAIL FLOW SIMULATOR",15,C.muted,700,'letter-spacing="2"') + t(1008,1288,`0${i} / 05`,28,C.ink,700,'text-anchor="end"');
const frame = async(file,x,y,w,h,label) => rect(x,y,w,h,"#061312",C.line,10) + `<clipPath id="clip-${file.replace(/\W/g,"")}"><rect x="${x+7}" y="${y+7}" width="${w-14}" height="${h-14}" rx="7"/></clipPath>` + `<g clip-path="url(#clip-${file.replace(/\W/g,"")})">${await image(file,x+7,y+7,w-14,h-14)}</g>` + rect(x+20,y+20,285,38,"rgba(5,21,20,.85)","none",5) + t(x+34,y+46,label,14,C.ink,700,'letter-spacing="1"');

const slides=[];
slides.push(["01-cover",
  lines(72,230,["Upload a shop.","Watch people use it."],76,C.ink,700,87) +
  t(72,431,"AI SHOPPER-FLOW CONCEPT SIMULATION",18,C.mint,700,'letter-spacing="2"') +
  await frame("current-flow-mid.jpg",72,488,936,526,"HIGGSFIELD · CURRENT RUN") +
  (await image("higgsfield-icon.png",72,1052,38,38,"xMidYMid meet")) +
  t(126,1081,"HIGGSFIELD CINEMA STUDIO",18,C.mint,700,'letter-spacing="1.5"') +
  t(72,1157,"One image → movement → one layout idea.",27,C.muted,400)
]);
slides.push(["02-input",
  lines(72,218,["One photo becomes","a shopper simulation."],65,C.ink,700,75) +
  t(72,390,"01 · UPLOAD",17,C.orange,700,'letter-spacing="2"') +
  await frame("../public/assets/current-shop.png",72,426,440,340,"SOURCE IMAGE") +
  `<path d="M532 596h54" stroke="${C.mint}" stroke-width="3"/><path d="M574 584l14 12-14 12" fill="none" stroke="${C.mint}" stroke-width="3"/>` +
  await frame("current-flow-mid.jpg",608,426,400,340,"8-SEC VIDEO") +
  lines(72,846,["The camera stays fixed.","People enter, browse and queue."],36,C.ink,700,48) +
  rect(72,979,936,158,C.panel,C.line,10) +
  t(104,1023,"THE PROMPT DEFINES THE SCENARIO",15,C.mint,700,'letter-spacing="2"') +
  lines(104,1071,["Five shoppers · natural walking · one continuous shot","Preserve the room, displays, entrance and checkout"],23,C.muted,400,34)
]);
slides.push(["03-observation",
  lines(72,218,["The video makes","the pinch point visible."],64,C.ink,700,75) +
  await frame("current-flow-mid.jpg",72,390,936,526,"CURRENT LAYOUT · FRAME 04:00") +
  `<ellipse cx="742" cy="693" rx="168" ry="104" fill="none" stroke="${C.orange}" stroke-width="5" stroke-dasharray="14 10"/>` +
  rect(625,809,345,61,C.orange,"none",8) + t(797,849,"PATHS CONVERGE HERE",17,"#071b1b",800,'text-anchor="middle" letter-spacing="1"') +
  lines(72,1001,["Entry, browsing and checkout routes","meet beside the central island."],34,C.ink,700,45) +
  t(72,1131,"Visible observation, not measured footfall.",21,C.muted)
]);
slides.push(["04-rerun",
  lines(72,206,["Change one thing.","Run it again."],70,C.ink,700,82) +
  t(72,372,"SAME CAMERA · SAME SHOPPER SCENARIO",17,C.mint,700,'letter-spacing="2"') +
  await frame("current-flow-mid.jpg",72,414,444,362,"BEFORE") +
  await frame("revised-flow-mid.jpg",564,414,444,362,"AFTER") +
  t(72,828,"CENTRAL ISLAND",17,C.orange,700,'letter-spacing="1.5"') +
  t(564,828,"OPEN CENTRAL ROUTE",17,C.mint,700,'letter-spacing="1.5"') +
  lines(72,912,["The revised run looks easier to read.","Now test the idea in the real shop."],39,C.ink,700,52) +
  rect(72,1075,936,91,C.panel,C.line,9) +
  t(540,1131,"CONCEPT COMPARISON · NO SALES UPLIFT CLAIM",18,C.muted,700,'text-anchor="middle" letter-spacing="1"')
]);
slides.push(["05-cta",
  lines(72,225,["A tiny demo.","A clearer conversation."],70,C.ink,700,83) +
  t(72,391,"WHAT'S INCLUDED",17,C.mint,700,'letter-spacing="2.5"') +
  rect(72,429,936,478,C.panel,C.line,12) +
  lines(112,491,["01   Local image upload","02   Two Higgsfield simulation videos","03   Visible-observation cards","04   Before / after comparison","05   Reusable generation brief"],31,C.ink,700,76) +
  t(72,978,"Free source code. Sample media included.",26,C.muted) +
  rect(72,1030,936,142,C.orange,"none",12) +
  t(540,1090,"Comment “CODE”",43,"#071b1b",800,'text-anchor="middle"') +
  t(540,1138,"to get the link. →",33,"#071b1b",800,'text-anchor="middle"')
]);

for (let i=0;i<slides.length;i++) {
  const [name,body]=slides[i];
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">${rect(0,0,1080,1350,C.bg)}${header()}${body}${footer(i+1)}</svg>`;
  await writeFile(new URL(name+".svg",out),svg);
  const png=new Resvg(svg,{font:{loadSystemFonts:true,defaultFontFamily:"Arial"}}).render().asPng();
  await writeFile(new URL(name+".png",out),png);
  console.log(`${name}: 1080 × 1350`);
}
