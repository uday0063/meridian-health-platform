/* Rendering, routing and event wiring */
function draw(){$("#r").innerHTML=S.role?app():land();S.fx=0;if(typeof afterDraw=="function")afterDraw();if(!S.role){const io=new IntersectionObserver(es=>es.forEach(x=>x.isIntersecting&&x.target.classList.add("v")),{threshold:.25});document.querySelectorAll(".ch").forEach(c=>io.observe(c))}}
function go(p){S.page=p;S.nav=0;if(p=="mine"){S.pi=0;S.page="profile"}S.ld=1;draw();$("#bar").className="s";scrollTo(0,0);clearTimeout(go.h);go.h=setTimeout(()=>{S.ld=0;S.fx=1;draw();$("#bar").className=""},520)}
function modal(h){const m=document.createElement("div");m.className="mod";m.innerHTML=`<div class="card">${h}<button data-a="x" style="margin-top:14px">Close</button></div>`;document.body.appendChild(m);m.onclick=e=>{if(e.target==m||e.target.dataset.a=="x")m.remove()}}
document.addEventListener("click",e=>{const t=e.target.closest("[data-a]");if(!t)return;const a=t.dataset.a,v=t.dataset.v;if(ACT[a]){ACT[a](v,t,e);return}
if(a=="pick"){$("#rl").hidden=false;$("#rl").scrollIntoView({behavior:"smooth"})}
else if(a=="role"){S.role=v;S.page="dash";S.fx=1;document.querySelector(".mod")?.remove();draw();scrollTo(0,0)}
else if(a=="go")go(v);else if(a=="nav"){S.nav=!S.nav;draw()}
else if(a=="pat"){S.pi=+v;S.tab="Overview";go("profile")}
else if(a=="f"){S.f=v;draw()}else if(a=="tab"){S.tab=v;draw()}
else if(a=="op"){S.open=S.open==v?null:v;draw()}
else if(a=="note")can(3)?toast("Clinical note saved to the shared record"):deny();
else if(a=="meal"){if(can(4)||S.role=="patient"){S.meals[+v]^=1;draw();toast("Meal log updated")}else deny()}
else if(a=="join"){if(can(5)||S.role=="patient"){S.joined[v]=1;draw();toast("You are booked into "+v)}else deny()}
else if(a=="inv")can(6)?toast("Invitation sent"):deny();
else if(a=="qa")M[S.role][+v]==2?toast("Done. Saved to your workspace"):deny();
else if(a=="theme"){const d=document.documentElement;d.dataset.theme=d.dataset.theme=="dark"?"light":"dark"}
else if(a=="bell")modal("<h3>Notifications</h3><p style='margin-top:10px'>HbA1c Panel is ready for review.</p><p>Rohan Mehta’s nutrition plan was updated.</p><p>Appointment confirmed for 14 Nov.</p>");
else if(a=="sw")modal("<h3>Switch role</h3><div class='g' style='margin-top:12px'>"+Object.keys(RL).map(k=>`<button class="${k==S.role?"p":""}" data-a="role" data-v="${k}">${RL[k][0]} · ${RL[k][2]}</button>`).join("")+"</div>");
else if(a=="rep"){const r=R.find(x=>x.n==v),st=S.rev[v]||r.st;modal(`<h3>${r.n}</h3><p class="m">${r.cat} · ${P[r.p].n} · ${r.d}</p><table style="margin-top:12px"><tr><th>Marker</th><th>Result</th><th>Range</th></tr><tr><td>Hemoglobin</td><td>13.4</td><td>12–16 g/dL</td></tr><tr><td>HbA1c</td><td>${st=="Flagged"?"7.9 ⚠":"6.8"}</td><td>under 7.0 %</td></tr><tr><td>LDL</td><td>112</td><td>under 130 mg/dL</td></tr></table><p style="margin:12px 0">${chip(st)}</p><button data-a="dl">Download</button> <button class="p" data-a="rv" data-v="${v}">Mark as reviewed</button>`)}
else if(a=="dl")toast("Download started (simulated)");
else if(a=="rv"){if(can(2)){S.rev[v]="Reviewed";document.querySelector(".mod")?.remove();draw();toast("Report marked as reviewed")}else deny()}
else if(a=="gs"){}});
document.addEventListener("mousemove",e=>{const c=e.target.closest(".g4 .card,.roles button");if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(700px) rotateX(${-y*8}deg) rotateY(${x*8}deg) translateY(-2px)`});
document.addEventListener("mouseout",e=>{const c=e.target.closest(".g4 .card,.roles button");if(c)c.style.transform=""});
setInterval(()=>{const e=document.getElementById("hr");if(e)e.textContent=P[S.pi].hr+Math.round(Math.random()*4-2)},1500);
document.addEventListener("input",e=>{if(e.target.id=="q"){S.q=e.target.value;$("#list").innerHTML=lst()}else if(e.target.dataset.a=="gs"&&e.target.value.length>2&&S.role){S.q=e.target.value;S.page="patients";draw();$("#q").focus()}});
draw();
