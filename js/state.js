/* Shared state and helpers */
const S={role:null,page:"dash",pi:0,tab:"Overview",q:"",f:"All",nav:0,rep:null,rev:{},meals:[1,1,0,0],open:null,joined:{}};
const $=s=>document.querySelector(s),can=i=>M[S.role][i]==2,ini=n=>n.split(" ").filter(x=>!x.startsWith("Dr")).map(x=>x[0]).join("").slice(0,2);
function toast(m){const t=$("#t");t.textContent=m;t.className="s";clearTimeout(toast.h);toast.h=setTimeout(()=>t.className="",2200)}
const deny=()=>toast("Read-only for your role: "+RL[S.role][0]);
const ACT={}; // action handlers keyed by data-a, registered by features.js
