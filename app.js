(() => {
  'use strict';
  const STORAGE_KEY = 'bugtrack_bca_demo_v1';
  const today = new Date();
  const isoDate = (offset = 0) => { const d = new Date(today); d.setDate(d.getDate() + offset); return d.toISOString(); };
  const initialIssues = [
    {id:'BUG-104', title:'Password reset link expires too early', description:'When a user requests a password reset, the emailed link appears to expire before the user can complete the process. Steps: open Forgot Password, request the link, then open it after a short delay. Expected result: the link remains usable for the configured validity period.', type:'Bug', priority:'High', status:'Open', assignee:'Ayesha Khan', reporter:'Faiz Ahmad', createdAt:isoDate(-1), updatedAt:isoDate(-1)},
    {id:'BUG-103', title:'Dashboard cards overlap on tablet width', description:'At medium viewport widths, the summary cards do not keep equal spacing and can look crowded. Expected result: the cards wrap into a balanced responsive grid without overlapping.', type:'UI / UX', priority:'Medium', status:'In Progress', assignee:'Rohit Sharma', reporter:'Faiz Ahmad', createdAt:isoDate(-2), updatedAt:isoDate(0)},
    {id:'BUG-102', title:'Issue list takes too long to load', description:'The issues page becomes slow when a large set of records is displayed. Review unnecessary repeated rendering and consider pagination or server-side filtering in a future backend implementation.', type:'Performance', priority:'Critical', status:'Open', assignee:'Imran Ali', reporter:'Faiz Ahmad', createdAt:isoDate(-3), updatedAt:isoDate(-2)},
    {id:'BUG-101', title:'Status label not updated after save', description:'After changing an issue status, the list should immediately show the new value. This demo updates the locally stored issue and re-renders affected views.', type:'Bug', priority:'Low', status:'Resolved', assignee:'Ayesha Khan', reporter:'Faiz Ahmad', createdAt:isoDate(-5), updatedAt:isoDate(-1)},
    {id:'BUG-100', title:'Add keyboard focus to close icon', description:'The close dialog control should have a clear keyboard focus state to help users who navigate with a keyboard.', type:'UI / UX', priority:'Medium', status:'Closed', assignee:'Rohit Sharma', reporter:'Faiz Ahmad', createdAt:isoDate(-7), updatedAt:isoDate(-4)},
    {id:'BUG-099', title:'CSV export should include issue details', description:'The exported report should contain the fields visible in the issue register and quote values safely when they include commas.', type:'Feature request', priority:'Low', status:'In Progress', assignee:'Unassigned', reporter:'Faiz Ahmad', createdAt:isoDate(-9), updatedAt:isoDate(-2)}
  ];
  const $ = (id) => document.getElementById(id);
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateText = (value) => { if(!value) return '—'; const d = new Date(value); return isNaN(d) ? '—' : d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); };
  const dateTimeText = (value) => { if(!value) return '—'; const d = new Date(value); return isNaN(d) ? '—' : d.toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); };
  const initials = (name) => name && name !== 'Unassigned' ? name.split(/\s+/).slice(0,2).map(p=>p[0]).join('').toUpperCase() : '—';
  const statusSlug = (status) => ({'Open':'open','In Progress':'in-progress','Resolved':'resolved','Closed':'closed'}[status] || 'open');
  const prioritySlug = (priority) => ({'Critical':'priority-critical','High':'priority-high','Medium':'priority-medium','Low':'priority-low'}[priority] || 'priority-medium');
  const typeClass = (type) => type === 'UI / UX' ? 'ui' : type === 'Performance' ? 'performance' : type === 'Feature request' ? 'feature' : 'bug';
  const typeIcon = (type) => type === 'UI / UX' ? '✧' : type === 'Performance' ? '↗' : type === 'Feature request' ? '✚' : '⚑';
  let issues = loadIssues();
  let activeDetailId = null;
  let toastTimer = null;

  function loadIssues(){
    try { const raw = localStorage.getItem(STORAGE_KEY); if(raw) { const data = JSON.parse(raw); if(Array.isArray(data)) return data; } }
    catch(err) { console.warn('Could not read local issue data.', err); }
    return initialIssues.map(x=>({...x}));
  }
  function saveIssues(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(issues)); return true; }
    catch(err) { showToast('Browser storage is unavailable. Changes may not persist.', 'error'); return false; }
  }
  function nextId(){
    const nums = issues.map(x=>Number((x.id.match(/\d+/)||['0'])[0]));
    return 'BUG-' + String(Math.max(104,...nums)+1).padStart(3,'0');
  }
  function showToast(message, type='success'){
    const toast=$('toast'); toast.textContent=message; toast.className='toast '+type;
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.add('hidden'),3200);
  }
  function counts(){
    const result={total:issues.length,Open:0,'In Progress':0,Resolved:0,Closed:0,Critical:0,High:0,Medium:0,Low:0};
    issues.forEach(i=>{result[i.status]=(result[i.status]||0)+1;result[i.priority]=(result[i.priority]||0)+1;});
    return result;
  }
  function rowHtml(issue, detailed=false){
    const person = issue.assignee || 'Unassigned';
    const avatarClass = ['','alt1','alt2','alt3'][Math.abs((person.charCodeAt(0)||0)%4)];
    return `<tr data-id="${escapeHtml(issue.id)}" tabindex="0" aria-label="Open ${escapeHtml(issue.id)} details"><td><div class="issue-cell"><span class="issue-type-icon ${typeClass(issue.type)}">${typeIcon(issue.type)}</span><div class="issue-title-wrap"><strong>${escapeHtml(issue.title)}</strong><small>${escapeHtml(issue.id)} · ${escapeHtml(issue.type)}</small></div></div></td>${detailed?`<td>${escapeHtml(issue.type)}</td>`:''}<td><span class="priority-tag ${prioritySlug(issue.priority)}">${escapeHtml(issue.priority)}</span></td><td><span class="status-tag status-${statusSlug(issue.status)}">${escapeHtml(issue.status)}</span></td><td><div class="assignee-cell"><span class="mini-avatar ${avatarClass}">${escapeHtml(initials(person))}</span>${escapeHtml(person)}</div></td>${detailed?`<td>${dateText(issue.createdAt)}</td><td><div class="issue-actions"><button class="table-icon-button" data-action="details" data-id="${escapeHtml(issue.id)}" title="View details" aria-label="View details">↗</button><button class="table-icon-button" data-action="edit" data-id="${escapeHtml(issue.id)}" title="Edit issue" aria-label="Edit issue">✎</button></div></td>`:''}</tr>`;
  }
  function renderDashboard(){
    const c=counts(); $('metricTotal').textContent=c.total; $('metricOpen').textContent=c.Open; $('metricProgress').textContent=c['In Progress']; $('metricResolved').textContent=c.Resolved+c.Closed; $('issueNavCount').textContent=c.total;
    $('donutTotal').textContent=c.total;
    const total=Math.max(1,c.total); const colors=['#6f5fe8','#4c94ed','#f0a351','#22ad80'];
    let start=0; const vals=[c.Open,c['In Progress'],c.Resolved,c.Closed];
    const segs=vals.map((v,i)=>{const end=start+v/total*100;const s=`${colors[i]} ${start}% ${end}%`;start=end;return s;});
    $('statusDonut').style.background=c.total?`conic-gradient(${segs.join(',')})`:'#eceef5';
    const names=['Open','In Progress','Resolved','Closed'];
    $('statusLegend').innerHTML=names.map((n,i)=>`<div class="legend-row"><span class="legend-key" style="background:${colors[i]}"></span>${n}<strong>${c[n]}</strong></div>`).join('');
    $('priorityBars').innerHTML=[['Critical','fill-critical'],['High','fill-high'],['Medium','fill-medium'],['Low','fill-low']].map(([n,cls])=>`<div class="priority-item"><div class="priority-item-top"><span>${n}</span><strong>${c[n]}</strong></div><div class="bar-track"><div class="bar-fill ${cls}" style="width:${c.total?Math.max(c[n]/c.total*100, c[n]?3:0):0}%"></div></div></div>`).join('');
    const q=$('dashboardSearch').value.trim().toLowerCase(), st=$('dashboardStatus').value;
    const visible=issues.filter(i=>(st==='all'||i.status===st)&&(!q||[i.id,i.title,i.assignee,i.type].join(' ').toLowerCase().includes(q))).slice(0,5);
    $('dashboardIssueRows').innerHTML=visible.map(i=>rowHtml(i)).join('');
    $('dashboardEmpty').classList.toggle('hidden',visible.length>0);
  }
  function filteredIssues(){
    const q=$('issuesSearch').value.trim().toLowerCase(), st=$('issuesStatus').value, pr=$('issuesPriority').value;
    return issues.filter(i=>(st==='all'||i.status===st)&&(pr==='all'||i.priority===pr)&&(!q||[i.id,i.title,i.description,i.assignee,i.reporter,i.type].join(' ').toLowerCase().includes(q))).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  }
  function renderIssues(){
    const filtered=filteredIssues(); $('allIssueRows').innerHTML=filtered.map(i=>rowHtml(i,true)).join(''); $('issuesEmpty').classList.toggle('hidden',filtered.length>0); $('issueCountLabel').textContent=`Showing ${filtered.length} of ${issues.length} issue${issues.length===1?'':'s'}`;
  }
  function renderReports(){
    const c=counts(); $('reportTotal').textContent=c.total; $('reportOpen').textContent=c.Open+c['In Progress']; const finished=c.Resolved+c.Closed; $('reportRate').textContent=(c.total?Math.round(finished/c.total*100):0)+'%';
    const statusItems=[['Open',c.Open,'#4c94ed'],['In Progress',c['In Progress'],'#f0a351'],['Resolved',c.Resolved,'#22ad80'],['Closed',c.Closed,'#9ba1b3']];
    $('reportStatusBars').innerHTML=statusItems.map(([n,v,col])=>`<div class="report-bar-row"><span>${n}</span><div class="report-bar-track"><div class="report-bar-fill" style="background:${col};width:${c.total?Math.max(v/c.total*100,v?3:0):0}%"></div></div><strong>${v}</strong></div>`).join('');
    const priItems=[['Critical',c.Critical,'#e66b74'],['High',c.High,'#f0a05a'],['Medium',c.Medium,'#edc25c'],['Low',c.Low,'#5b9cec']];
    $('reportPriorityBars').innerHTML=priItems.map(([n,v,col])=>`<div class="report-bar-row"><span>${n}</span><div class="report-bar-track"><div class="report-bar-fill" style="background:${col};width:${c.total?Math.max(v/c.total*100,v?3:0):0}%"></div></div><strong>${v}</strong></div>`).join('');
  }
  function renderAll(){renderDashboard();renderIssues();renderReports();}
  function switchView(view){
    const allowed=['dashboard','issues','reports']; if(!allowed.includes(view)) view='dashboard';
    document.querySelectorAll('.view').forEach(el=>el.classList.remove('active-view'));
    $(view+'View').classList.add('active-view'); document.querySelectorAll('.nav-link').forEach(a=>a.classList.toggle('active',a.dataset.view===view));
    $('breadcrumbCurrent').textContent=view==='dashboard'?'Dashboard':view==='issues'?'All issues':'Reports'; document.title=(view==='dashboard'?'Dashboard':view==='issues'?'All issues':'Reports')+' — BugTrack';
    $('sidebar').classList.remove('open'); if(view==='issues') renderIssues(); if(view==='reports')renderReports();
  }
  function openIssueModal(issue=null){
    $('issueForm').reset(); $('editIssueId').value=issue?issue.id:''; $('modalTitle').textContent=issue?'Edit issue':'Report an issue'; $('modalEyebrow').textContent=issue?issue.id:'NEW ISSUE'; $('saveIssueBtn').textContent=issue?'Save changes':'Save issue';
    if(issue){$('issueTitle').value=issue.title;$('issueDescription').value=issue.description;$('issueType').value=issue.type;$('issuePriorityInput').value=issue.priority;$('issueAssignee').value=issue.assignee==='Unassigned'?'':issue.assignee;$('issueStatusInput').value=issue.status;}
    $('issueModal').classList.remove('hidden'); setTimeout(()=>$('issueTitle').focus(),30);
  }
  function closeIssueModal(){$('issueModal').classList.add('hidden');}
  function openDetails(id){
    const issue=issues.find(i=>i.id===id); if(!issue)return; activeDetailId=id;
    $('detailIdLabel').textContent=issue.id+' · REPORTED '+dateText(issue.createdAt).toUpperCase(); $('detailTitle').textContent=issue.title; $('detailMeta').textContent='Reported by '+(issue.reporter||'Faiz Ahmad'); $('detailBadges').innerHTML=`<span class="priority-tag ${prioritySlug(issue.priority)}">${escapeHtml(issue.priority)} priority</span><span class="status-tag status-${statusSlug(issue.status)}">${escapeHtml(issue.status)}</span>`; $('detailDescription').textContent=issue.description; $('detailType').textContent=issue.type; $('detailAssignee').textContent=issue.assignee||'Unassigned'; $('detailReported').textContent=dateTimeText(issue.createdAt); $('detailUpdated').textContent=dateTimeText(issue.updatedAt); $('detailStatusSelect').value=issue.status; $('detailModal').classList.remove('hidden');
  }
  function closeDetails(){$('detailModal').classList.add('hidden');activeDetailId=null;}
  function submitIssue(event){
    event.preventDefault(); const id=$('editIssueId').value; const title=$('issueTitle').value.trim(), description=$('issueDescription').value.trim();
    if(title.length<4){showToast('Please enter a title with at least 4 characters.','error');$('issueTitle').focus();return;}
    if(description.length<8){showToast('Please add a little more detail to the description.','error');$('issueDescription').focus();return;}
    const now=new Date().toISOString(); const current=id?issues.find(i=>i.id===id):null;
    const item={id:id||nextId(),title,description,type:$('issueType').value,priority:$('issuePriorityInput').value,status:$('issueStatusInput').value,assignee:$('issueAssignee').value.trim()||'Unassigned',reporter:current?.reporter||'Faiz Ahmad',createdAt:current?.createdAt||now,updatedAt:now};
    if(current){issues=issues.map(i=>i.id===id?item:i);}else{issues.unshift(item);}
    saveIssues();renderAll();closeIssueModal();showToast(current?'Issue updated successfully.':'Issue reported successfully.');
  }
  function deleteActiveIssue(){if(!activeDetailId)return;const issue=issues.find(i=>i.id===activeDetailId);if(!issue)return;if(!window.confirm(`Delete ${issue.id}: "${issue.title}"? This cannot be undone.`))return;issues=issues.filter(i=>i.id!==activeDetailId);saveIssues();closeDetails();renderAll();showToast('Issue deleted.');}
  function updateStatus(){if(!activeDetailId)return;const issue=issues.find(i=>i.id===activeDetailId);if(!issue)return;issue.status=$('detailStatusSelect').value;issue.updatedAt=new Date().toISOString();saveIssues();renderAll();openDetails(issue.id);showToast('Issue status updated.');}
  function exportCsv(){
    const source=document.querySelector('#issuesView').classList.contains('active-view')?filteredIssues():issues;
    const cols=['ID','Title','Description','Type','Priority','Status','Assignee','Reporter','Created At','Updated At'];
    const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
    const rows=[cols,...source.map(i=>[i.id,i.title,i.description,i.type,i.priority,i.status,i.assignee,i.reporter,dateTimeText(i.createdAt),dateTimeText(i.updatedAt)])];
    const blob=new Blob(['\ufeff'+rows.map(r=>r.map(quote).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='bugtrack-issues.csv';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast('CSV export prepared.');
  }
  function openGuide(){showToast('Quick guide: report a clear title, steps to reproduce, priority and current status. Click any issue to inspect it.');}

  document.querySelectorAll('.nav-link').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();switchView(a.dataset.view);}));
  $('newIssueBtn').addEventListener('click',()=>openIssueModal());$('newIssueBtn2').addEventListener('click',()=>openIssueModal());$('viewAllBtn').addEventListener('click',()=>switchView('issues'));$('priorityViewBtn').addEventListener('click',()=>switchView('issues'));
  $('dashboardSearch').addEventListener('input',renderDashboard);$('dashboardStatus').addEventListener('change',renderDashboard);
  ['issuesSearch','issuesStatus','issuesPriority'].forEach(id=>$(id).addEventListener(id==='issuesSearch'?'input':'change',renderIssues));
  $('clearFilters').addEventListener('click',()=>{$('issuesSearch').value='';$('issuesStatus').value='all';$('issuesPriority').value='all';renderIssues();});
  $('exportCsv').addEventListener('click',exportCsv);$('reportExportBtn').addEventListener('click',exportCsv);
  $('issueForm').addEventListener('submit',submitIssue);$('closeModal').addEventListener('click',closeIssueModal);$('cancelModal').addEventListener('click',closeIssueModal);$('closeDetail').addEventListener('click',closeDetails);$('saveStatusBtn').addEventListener('click',updateStatus);$('deleteIssueBtn').addEventListener('click',deleteActiveIssue);$('helpButton').addEventListener('click',openGuide);$('guideLink').addEventListener('click',e=>{e.preventDefault();openGuide();});$('mobileMenu').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
  $('issueModal').addEventListener('click',e=>{if(e.target===$('issueModal'))closeIssueModal();});$('detailModal').addEventListener('click',e=>{if(e.target===$('detailModal'))closeDetails();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeIssueModal();closeDetails();$('sidebar').classList.remove('open');}});
  document.addEventListener('click',e=>{const action=e.target.closest('[data-action]');if(action){e.stopPropagation();const issue=issues.find(i=>i.id===action.dataset.id);if(!issue)return;if(action.dataset.action==='edit')openIssueModal(issue);else openDetails(issue.id);return;}const row=e.target.closest('tr[data-id]');if(row&&row.closest('.issue-table'))openDetails(row.dataset.id);});
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('tr[data-id]')){e.preventDefault();openDetails(e.target.dataset.id);}});
  renderAll();
})();
