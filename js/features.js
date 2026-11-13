/* Interactive features layered on the core app: command palette, booking wizard,
   add patient, report upload, guided breathing, live chart tooltips, notifications. */
Object.assign(S,{range:"7d",rc:"All",rq:"",hf:"All",hq:""});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const mbox=h=>{const c=document.querySelector(".mod .card");if(c)c.innerHTML=h+'<button data-a="x" style="margin-top:14px">Close</button>'};
try{const t=localStorage.getItem("mh-theme");if(t)document.documentElement.dataset.theme=t}catch(e){}

/* Theme (remembered) */
ACT.theme=()=>{const d=document.documentElement;d.dataset.theme=d.dataset.theme=="dark"?"light":"dark";try{localStorage.setItem("mh-theme",d.dataset.theme)}catch(e){}};

/* Notifications with read state */
const N=[{t:"HbA1c Panel is ready for review.",w:"9m",r:0},{t:"Rohan Mehta’s nutrition plan was updated.",w:"1h",r:0},{t:"Appointment confirmed for 14 Nov.",w:"Yesterday",r:0}];
const unread=()=>N.filter(n=>!n.r).length;
const refreshBell=()=>{const b=document.querySelector('[data-a="bell"]');if(b)b.textContent="🔔 "+unread()};
function notif(){mbox(`<h3>Notifications</h3><div style="margin-top:8px">${N.map((n,i)=>`<div class="row" data-a="nr" data-v="${i}" style="${n.r?"opacity:.55":""}"><span class="ud" style="${n.r?"visibility:hidden":""}"></span><div style="flex:1">${n.t}<div class="m">${n.w}</div></div></div>`).join("")}</div><button data-a="nall" style="margin-top:10px">Mark all as read</button>`)}
ACT.bell=()=>{modal("");notif()};
ACT.nr=v=>{N[+v].r=1;notif();refreshBell()};
ACT.nall=()=>{N.forEach(n=>n.r=1);notif();refreshBell()};

/* Dashboard trend with range toggle and hover tooltips */
const TR={"7d":[[22,31,27,35,29,41,38],["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]],"30d":[[24,28,31,29,35,33,38,36,40,42],["Wk1 a","Wk1 b","Wk2 a","Wk2 b","Wk3 a","Wk3 b","Wk4 a","Wk4 b","Wk5 a","Wk5 b"]],"90d":[[20,23,26,25,29,31,30,34,37,39,41,44],["Wk 1","Wk 2","Wk 3","Wk 4","Wk 5","Wk 6","Wk 7","Wk 8","Wk 9","Wk 10","Wk 11","Wk 12"]]};
function trendCard(){const[d,l]=TR[S.range];return`<div class="card" id="trend"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3>Wellness trend, last ${S.range.replace("d"," days")}</h3><div class="seg">${Object.keys(TR).map(k=>`<button data-a="rng" data-v="${k}" class="${S.range==k?"p":""}">${k}</button>`).join("")}</div></div><p class="m">Average active minutes. Hover a bar for the value.</p>${bars(d,110,"var(--acc)",l)}</div>`}
ACT.rng=v=>{S.range=v;const t=$("#trend");if(t)t.outerHTML=trendCard()};
const tip=document.createElement("div");tip.id="tip";document.body.appendChild(tip);
document.addEventListener("mousemove",e=>{const t=e.target.closest&&e.target.closest("[data-tip]");if(!t){tip.style.opacity=0;return}tip.textContent=t.dataset.tip;tip.style.opacity=1;tip.style.left=e.clientX+12+"px";tip.style.top=e.clientY-34+"px"});

/* Reports: filter chips and search */
function rlf(){const q=S.rq.toLowerCase(),l=R.filter(r=>(S.rc=="All"||r.cat==S.rc)&&(S.role!="patient"||r.p==0)&&(r.n+r.cat+P[r.p].n).toLowerCase().includes(q));return l.length?rl(l):`<p class="m" style="padding:20px 0">No reports match. Clear the search or pick another category.</p>`}
ACT.rc=v=>{S.rc=v;draw()};

/* Medical history: filter chips and search */
const hfl=()=>{const q=S.hq.toLowerCase();return H.filter(h=>(S.hf=="All"||h[1]==S.hf)&&(h[2]+h[1]).toLowerCase().includes(q))};
const hl=(p,l)=>l.length?l.map(h=>`<div><b>${h[2].replace("Primary diagnosis recorded",p.c)}</b> ${chip(h[3])}<div class="m">${h[0]} · ${h[1]}</div></div>`).join(""):`<p class="m">No entries match. Try another type.</p>`;
function hist(p){return`<div class="card"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px"><input id="hq" placeholder="Search history" aria-label="Search history" style="max-width:220px" value="${esc(S.hq)}">${["All","Condition","Medication","Allergy","Vaccination","Surgery"].map(c=>`<button data-a="hf" data-v="${c}" class="${S.hf==c?"p":""}">${c}</button>`).join("")}</div><div class="tl" id="hl">${hl(p,hfl())}</div></div>`}
ACT.hf=v=>{S.hf=v;draw()};

/* Guided breathing */
function well(){return wellBase()+`<div class="card zen" style="margin-top:14px;text-align:center"><h3 style="justify-content:center">Guided breathing</h3><div class="br"><div id="bc"></div><b id="bt">Ready</b></div><p class="m" id="bs">Inhale 4s, hold 4s, exhale 6s. Press start.</p><button class="p" data-a="breath" id="bb">Start</button></div>`}
let BT=null;
function stopB(){clearInterval(BT);BT=null;const bc=$("#bc");if(bc){bc.style.transitionDuration=".6s";bc.style.transform="scale(.55)"}if($("#bt"))$("#bt").textContent="Ready";if($("#bb"))$("#bb").textContent="Start";if($("#bs"))$("#bs").textContent="Nicely done. Press start to go again."}
ACT.breath=()=>{if(BT){stopB();return}const ph=[["Inhale",4,1],["Hold",4,1],["Exhale",6,.55]];let i=0,left=0,cyc=0;
const step=()=>{const bc=$("#bc");if(!bc){clearInterval(BT);BT=null;return}if(left<=0){const p=ph[i%3];bc.style.transitionDuration=p[1]+"s";bc.style.transform="scale("+p[2]+")";left=p[1];$("#bt").textContent=p[0];if(i%3==0)cyc++;i++;$("#bs").textContent="Cycle "+cyc+": "+p[0]+" for "+p[1]+"s"}left--};
$("#bb").textContent="Stop";step();BT=setInterval(step,1000)};

/* Command palette (Ctrl/Cmd + K) */
let PI=[],PL=[],PX=0;
function palItems(){const r=S.role;
const pg=NAV.filter(n=>n[2]<0||M[r][n[2]]>0&&!(r=="patient"&&n[0]=="admin")).map(n=>({k:"Page",t:r=="patient"&&n[0]=="patients"?"My record":n[1],f:()=>go(r=="patient"&&n[0]=="patients"?"mine":n[0])}));
const ps=P.map((p,i)=>({p,i})).filter(x=>r!="patient"||x.i==0).map(x=>({k:"Patient",t:x.p.n,s:x.p.c,f:()=>{S.pi=x.i;S.tab="Overview";go("profile")}}));
const rs=R.filter(x=>M[r][2]>0&&(r!="patient"||x.p==0)).map(x=>({k:"Report",t:x.n,s:P[x.p].n,f:()=>{const b=document.createElement("i");b.dataset.a="rep";b.dataset.v=x.n;document.body.appendChild(b);b.click();b.remove()}}));
const cs=C.filter(x=>M[r][3]>0&&(r!="patient"||x.p==0)).map(x=>({k:"Consult",t:x.t,s:P[x.p].n,f:()=>go("consults")}));
return[...pg,...ps,...rs,...cs]}
function palDraw(q){q=q.toLowerCase();PL=PI.filter(x=>(x.t+" "+(x.s||"")+" "+x.k).toLowerCase().includes(q)).slice(0,30);PX=Math.min(PX,Math.max(PL.length-1,0));$("#pl").innerHTML=PL.length?PL.map((x,i)=>`<div class="pi ${i==PX?"sel":""}" data-a="pgo" data-v="${i}"><span class="chip">${x.k}</span><span style="flex:1">${esc(x.t)}</span><span class="m">${esc(x.s||"")}</span></div>`).join(""):`<p class="m" style="padding:14px">Nothing found. Try a patient name or a page.</p>`}
ACT.pal=()=>{if(!S.role||$("#pal"))return;const m=document.createElement("div");m.className="mod";m.id="pal";m.style.alignItems="start";m.innerHTML=`<div class="card" style="margin-top:10vh;padding:0"><input id="pq" placeholder="Search pages, patients, reports" aria-label="Command palette" style="border:0;border-bottom:1px solid var(--line);border-radius:16px 16px 0 0;padding:16px"><div id="pl" style="max-height:50vh;overflow:auto;padding:6px"></div><div class="m" style="padding:8px 14px;border-top:1px solid var(--line)">Up and down to move, Enter to open, Esc to close</div></div>`;document.body.appendChild(m);m.onclick=e=>{if(e.target==m)m.remove()};PI=palItems();PX=0;palDraw("");$("#pq").focus()};
ACT.pgo=v=>{const x=PL[+v];$("#pal")&&$("#pal").remove();if(x)x.f()};
document.addEventListener("keydown",e=>{
if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()=="k"){e.preventDefault();ACT.pal();return}
if(e.key=="Escape"){document.querySelectorAll(".mod").forEach(m=>m.remove());return}
if(!$("#pal"))return;
if(e.key=="ArrowDown"||e.key=="ArrowUp"){e.preventDefault();PX=(PX+(e.key=="ArrowDown"?1:-1)+PL.length)%Math.max(PL.length,1);palDraw($("#pq").value);const s=document.querySelector(".pi.sel");if(s&&s.scrollIntoView)s.scrollIntoView({block:"nearest"})}
if(e.key=="Enter"){e.preventDefault();ACT.pgo(PX)}});
document.addEventListener("input",e=>{const id=e.target.id;
if(id=="pq"){PX=0;palDraw(e.target.value)}
else if(id=="rq"){S.rq=e.target.value;$("#rlist").innerHTML=rlf()}
else if(id=="hq"){S.hq=e.target.value;$("#hl").innerHTML=hl(P[S.pi],hfl())}});

/* Booking wizard: specialist, time, confirm */
const WHO=[["Dr. Neha Kapoor","Endocrinology"],["Dr. Arjun Sethi","Cardiology"],["Kavya Nair","Nutritionist"],["Arun Shetty","Yoga instructor"]];
const DAYS=["Sat 14 Nov","Mon 16 Nov","Tue 17 Nov","Wed 18 Nov","Thu 19 Nov","Fri 20 Nov"],SLOTS=["09:00","10:30","12:00","15:00","16:30","18:00"];
let W={};
function wz(){const s=W.s;let b="";
if(s==1)b=WHO.map((w,i)=>`<div class="row" data-a="wwho" data-v="${i}"><div class="av">${ini(w[0])}</div><div style="flex:1"><b>${w[0]}</b><div class="m">${w[1]}</div></div></div>`).join("");
if(s==2)b=`<p class="m" style="margin-bottom:8px">Pick a day and a time with ${W.who}.</p><div class="chips">${DAYS.map(d=>`<button data-a="wday" data-v="${d}" class="${W.day==d?"p":""}">${d}</button>`).join("")}</div><div class="chips" style="margin-top:10px">${SLOTS.map(t=>`<button data-a="wtime" data-v="${t}" class="${W.time==t?"p":""}">${t}</button>`).join("")}</div>`;
if(s==3)b=`<p><b>${W.who}</b></p><p class="m">${W.day} at ${W.time}, video consultation</p><label class="m" style="display:block;margin-top:10px">Reason for visit</label><input id="wr" placeholder="For example: review latest reports"><button class="p" data-a="wok" style="margin-top:12px">Confirm booking</button>`;
mbox(`<h3>Schedule consultation</h3><div class="steps">${["Specialist","Time","Confirm"].map((t,i)=>`<span class="${i+1<=s?"on":""}">${i+1}. ${t}</span>`).join("")}</div>${b}${s>1?'<button data-a="wback" style="margin-top:12px;margin-right:8px">Back</button>':""}`)}
ACT.book=()=>{if(!(can(3)||S.role=="patient"))return deny();W={s:1};modal("");wz()};
ACT.wwho=v=>{W.who=WHO[+v][0];W.s=2;wz()};
ACT.wday=v=>{W.day=v;if(W.time)W.s=3;wz()};
ACT.wtime=v=>{W.time=v;if(W.day)W.s=3;wz()};
ACT.wback=()=>{W.s--;wz()};
ACT.wok=()=>{const r=$("#wr").value.trim();C.unshift({p:S.role=="patient"?0:S.pi,t:r||"Consultation with "+W.who,u:true,dt:W.day+", "+W.time,m:"Video",dx:"",n:"Booked on the platform. Notes will be added at the visit.",d:W.who});N.unshift({t:"Consultation booked with "+W.who+" for "+W.day+".",w:"Just now",r:0});$(".mod").remove();if(["consults","dash","profile"].includes(S.page))draw();toast("Consultation booked with "+W.who)};

/* Add patient */
ACT.addp=()=>{if(!can(0))return deny();modal("");mbox(`<h3>Add patient</h3><div class="frm"><label>Full name<input id="an"></label><label>Age<input id="aa" type="number" min="1" max="120"></label><label>Primary condition<input id="ac"></label><label>Gender<select id="ag"><option>F</option><option>M</option></select></label></div><p class="m" id="ae" style="color:var(--bad)"></p><button class="p" data-a="asave">Save patient</button>`)};
ACT.asave=()=>{const n=$("#an").value.trim(),a=+$("#aa").value,c=$("#ac").value.trim();if(!n||!a||!c){$("#ae").textContent="Enter a name, an age and a primary condition.";return}P.push({n,a,g:$("#ag").value,id:"MH-"+(1100+P.length),bg:"O+",c,s:"Stable",hr:72,bp:"120/80",w:70,bmi:24.5,glu:95});$(".mod").remove();S.pi=P.length-1;S.tab="Overview";toast(n+" added to your patients");go("profile")};

/* Report upload with drag and drop and progress */
let UF="";const pickF=f=>{UF=f.name;$("#dz").firstElementChild.textContent=f.name};
ACT.upl=()=>{if(!(can(2)||S.role=="patient"))return deny();UF="";modal("");mbox(`<h3>Upload report</h3><label class="drop" id="dz" for="fi"><b>Drop a file here</b><span class="m">or click to browse. Nothing leaves your device.</span><input id="fi" type="file" hidden></label><div class="frm" style="margin-top:12px"><label>Category<select id="uc">${["Blood Test","MRI Scan","X-Ray","Checkup","Prescription"].map(c=>`<option>${c}</option>`).join("")}</select></label></div><div class="pbar"><i id="pb"></i></div><button class="p" data-a="usave" style="margin-top:12px">Upload</button>`);
const dz=$("#dz");["dragenter","dragover"].forEach(t=>dz.addEventListener(t,e=>{e.preventDefault();dz.classList.add("on")}));
["dragleave","drop"].forEach(t=>dz.addEventListener(t,e=>{e.preventDefault();dz.classList.remove("on");if(t=="drop"&&e.dataTransfer&&e.dataTransfer.files[0])pickF(e.dataTransfer.files[0])}));
$("#fi").onchange=e=>e.target.files[0]&&pickF(e.target.files[0])};
ACT.usave=()=>{const pb=$("#pb"),cat=$("#uc").value,name=UF||"New "+cat;let w=0;const t=setInterval(()=>{w+=8+Math.random()*14;pb.style.width=Math.min(w,100)+"%";if(w>=100){clearInterval(t);R.unshift({n:name.replace(/\.[^.]+$/,""),cat,p:S.role=="patient"?0:S.pi,st:"Pending",d:D[0],dt:"13 Nov 2026"});UF="";const m=$(".mod");if(m)m.remove();toast("Report uploaded and sent for review");if(["reports","profile","dash"].includes(S.page))draw()}},120)};

/* After every render: hero spotlight and KPI count-up */
function afterDraw(){const h=document.querySelector(".hero");
if(h&&!h.dataset.sp){h.dataset.sp=1;h.addEventListener("mousemove",e=>{const r=h.getBoundingClientRect();h.style.setProperty("--mx",e.clientX-r.left+"px");h.style.setProperty("--my",e.clientY-r.top+"px")})}
if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;
document.querySelectorAll(".g4 .k").forEach(el=>{const m=el.textContent.match(/^(\d+)(%?)$/);if(!m)return;const n=+m[1],t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/900);el.textContent=Math.round(n*(1-Math.pow(1-k,3)))+m[2];if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)})}
