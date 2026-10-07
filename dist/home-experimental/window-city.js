// Four flat city depth layers, shared by all moods. No animated textures or SVG filters.
export function citySVG(mood='day'){
 const palettes={
 day:['#c8d9e8','#eee5d8','#cbd3d5','#a9b7bc','#82959b','#667a65','#e8d69b'],
 dusk:['#c5c8d8','#edd2bd','#c8c1c9','#aaa7b6','#858998','#647569','#ffe5b4'],
 night:['#17233b','#243552','#34445c','#28394f','#1d2d41','#1e342e','#efe3c4']};
 const [sky,horizon,far,mid,near,green,light]=palettes[mood]||palettes.day;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="396" viewBox="0 0 768 396">
 <defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${horizon}"/></linearGradient><radialGradient id="sun"><stop stop-color="${light}" stop-opacity=".75"/><stop offset=".55" stop-color="${light}" stop-opacity=".45"/><stop offset="1" stop-color="${light}" stop-opacity="0"/></radialGradient></defs>
 <path fill="url(#sky)" d="M0 0h768v396H0z"/><circle fill="url(#sun)" cx="595" cy="95" r="23"/>
 <g fill="#fff" opacity=".19"><path d="M70 90q20-12 44-7q15-14 40-3q29-2 49 10q-66 9-133 0z"/><path d="M369 64q32-13 61-4q22-9 49 5q-59 9-110-1z"/><path d="M503 151q30-14 59-7q16-9 35-2q33 0 51 10q-73 6-145-1z"/></g>
 <g id="distant" fill="${far}"><path d="M0 277v-35h27v-16h19v21h41v-52h18v-11h17v55h27v-21h36v35h29v-50h28v-35h13v74h27v-19h45v-40h24v50h33v-25h20v-12h21v42h35v-36h33v16h25v-72h17v-20h8v92h22v-31h35v18h46v-42h24v49h31v-29h29v47h36v119H0z"/></g>
 <g id="middle" fill="${mid}"><path d="M0 315v-41l27-13l28 13v18h25v-39h42v23h25v-56h21v-12h12v68h36v-32h34v18h42v-42h27v21h34v-29h39v52h25v-44h28v-20h12v64h45v-24h33v-37h40v51h26v-20h38v-49h29v64h43v-33h24v20h30v91H0z"/></g>
 <g id="rooftops" fill="${near}"><path d="M0 396v-72l24-12h47v22h33v-37h12v-11h9v11h30l18 14v31h35v-30h36v-28h13v-12h8v12h28v14h18v-34h12v-11h9v-14h6v-12h5v12h6v14h9v11h12v34h47v34h32v-19h36l17-12l18 12v24h35v-43h12v-11h9v11h36v27h43v-16h40l25 13h42v-31h32v99z"/>
 <path transform="translate(-120 -28)" d="M295 280h60v65h-60z M287 274h76v8h-76zm8-5q4-36 30-43q26 7 30 43zm25-43v-13h10v13zm3-13v-9h4v9z"/>
 <path fill="${light}" opacity=".48" d="M115 320h5v10h-5zm15 0h5v10h-5zm174-33h5v11h-5zm15 0h5v11h-5zm15 0h5v11h-5zm180 40h5v9h-5zm17 0h5v9h-5zm114 18h5v9h-5z"/></g>
 <g id="canopy" fill="${green}"><path d="M0 396v-23q10-30 29-21q14-33 36-8q17-13 30 8q24-29 44 4q23-14 38 10q19-27 35-8q20-18 42 14l26 5h233q21-24 35-11q16-36 37-17q19-27 43-3q20-9 30 13q22-26 44-3q15-19 37-4q21-23 39 7v37z"/></g></svg>`;
}
