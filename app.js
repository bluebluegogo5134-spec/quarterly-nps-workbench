const STORAGE_KEY = "quarterly-nps-workbench:v1";
const statusMeta = {
  "待上传": ["upload", "上传当期数据"], "预检异常": ["error", "继续处理异常"],
  "数据已确认": ["confirmed", "查看计算结果"], "内容审核中": ["review", "进入问题审核"],
  "待发布": ["publish", "预览报告"], "已封版": ["done", "查看封版报告"]
};
const seed = {
  activeId: "26Q3", tasks: [
    {id:"26Q3",quarter:"26Q3",name:"等级会员 NPS 报告",status:"待上传",updated:"尚未上传",progress:0,current:true},
    {id:"26Q2",quarter:"26Q2",name:"等级会员 NPS 报告",status:"已封版",updated:"2026-07-14 18:30",progress:100},
    {id:"26Q1",quarter:"26Q1",name:"等级会员 NPS 报告",status:"已封版",updated:"2026-04-18 16:20",progress:100},
    {id:"25Q4",quarter:"25Q4",name:"等级会员 NPS 报告",status:"已封版",updated:"2026-01-16 11:45",progress:100}
  ]
};
let state = loadState(); let filter = "all";
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||structuredClone(seed)}catch{return structuredClone(seed)}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));document.querySelector("#saveState").textContent="已保存到本机"}
function current(){return state.tasks.find(t=>t.id===state.activeId)||state.tasks[0]}
function stepsFor(progress){const labels=["数据预检","指标计算","内容审核","报告生成"];return labels.map((label,i)=>{const floor=i*25;const cls=progress>=floor+25?"complete":progress>floor||progress===floor&&i===0?"active":"";return `<div class="step ${cls}">${label}</div>`}).join("")}
function renderCurrent(){const t=current(),meta=statusMeta[t.status]||statusMeta["待上传"];document.querySelector("#currentTask").innerHTML=`
  <div class="current-top"><div><span class="quarter">${t.quarter}</span><h3 class="task-title">${escapeHtml(t.name)}</h3><div class="task-meta"><span>状态：${t.status}</span><span>数据更新时间：${t.updated}</span></div></div><span class="status ${meta[0]}">${t.status}</span></div>
  <div class="progress-wrap"><div class="progress-summary"><strong>任务完成进度</strong><span>${t.progress}%</span></div><div class="steps">${stepsFor(t.progress)}</div></div>
  <div class="actions"><button class="action-btn primary" data-action="continue">${meta[1]} →</button><button class="action-btn" data-action="preview">预览报告</button><button class="action-btn" data-action="details">任务详情</button></div>`}
function renderHistory(){const visible=state.tasks.filter(t=>t.id!==state.activeId).filter(t=>filter==="all"||(filter==="done"?t.status==="已封版":t.status!=="已封版"));const grid=document.querySelector("#taskGrid");grid.innerHTML=visible.length?visible.map(t=>`<article class="task-card"><span class="quarter">${t.quarter}</span><h3>${escapeHtml(t.name)}</h3><div class="card-row"><span>${t.status}</span><span>${t.progress}%</span></div><div class="mini-progress"><span style="width:${t.progress}%"></span></div><div class="card-row"><span>${t.updated}</span><button class="card-link" data-open="${t.id}">打开任务</button></div></article>`).join(""):"<div class='empty'>当前筛选下没有任务</div>"}
function renderSummary(){document.querySelector("#totalCount").textContent=state.tasks.length;document.querySelector("#workingCount").textContent=state.tasks.filter(t=>t.status!=="已封版").length;document.querySelector("#doneCount").textContent=state.tasks.filter(t=>t.status==="已封版").length}
function render(){renderSummary();renderCurrent();renderHistory();saveState()}
function toast(msg){const el=document.querySelector("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
document.querySelector("#newTaskBtn").addEventListener("click",()=>document.querySelector("#newTaskDialog").showModal());
document.querySelector("#createTaskBtn").addEventListener("click",e=>{e.preventDefault();const q=document.querySelector("#quarterInput").value,n=document.querySelector("#taskNameInput").value.trim();if(!n)return;if(state.tasks.some(t=>t.id===q)){toast(`${q} 已存在，已切换到该任务`);state.activeId=q}else{state.tasks.unshift({id:q,quarter:q,name:n,status:"待上传",updated:"尚未上传",progress:0});state.activeId=q}document.querySelector("#newTaskDialog").close();render()});
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));btn.classList.add("active");filter=btn.dataset.filter;renderHistory()}));
document.addEventListener("click",e=>{const open=e.target.dataset.open;if(open){state.activeId=open;render();scrollTo({top:0,behavior:"smooth"})}const action=e.target.dataset.action;if(action)toast(action==="continue"?"下一板块将接入文件上传与预检":action==="preview"?"报告预览将在后续板块开放":"季度数据已独立保存在本机")});
render();
