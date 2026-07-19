window.attendanceReport=window.attendanceReport||[];
window.leaveDashboard=window.leaveDashboard||{};

function set(id,v){
const e=document.getElementById(id);
if(e)e.innerHTML=v;
}

/* =========================
REPORT
========================= */
async function loadReport(){

await Promise.all([
loadAttendanceDashboard(),
loadLeaveDashboard()
]);

}

/* =========================
ATTENDANCE DASHBOARD
========================= */
async function loadAttendanceDashboard(){

const today=new Intl.DateTimeFormat("en-CA",{
timeZone:"Asia/Kuala_Lumpur"
}).format(new Date());

const r=await apiGet({
action:"getAttendanceReportDashboard",
from:today,
to:today
});

if(!r.success)return;

attendanceReport=r.records||[];

const s=r.summary||{};

set("presentCount",s.present||0);
set("lateCount",s.late||0);
set("absentCount",s.absent||0);
set("leaveCount",s.leave||0);

}

async function showAttendance(type){

const box=document.getElementById("attendanceList");
if(!box)return;
const data=attendanceReport.filter(x=>x.status==type);
box.innerHTML=data.map(x=>`

<div class="list-card">
<h3>${x.employee_name}</h3>
<p><b>ID:</b> ${x.employee_id}</p>
<p><b>Branch:</b> ${x.branch_name||"-"}</p>
<p><b>Status:</b> ${x.status}</p>
${x.checkIn?`<p><b>Check In:</b> ${x.checkIn}</p>`:""}
${x.checkOut?`<p><b>Check Out:</b> ${x.checkOut}</p>`:""}
${x.workHours?`<p><b>Work Hours:</b> ${x.workHours}</p>`:""}

</div>

`).join("")||"No Record";

}

/* =========================
LEAVE DASHBOARD
========================= */
async function loadLeaveDashboard(){

const r=await apiGet({action:"getLeaveDashboard"});
if(!r.success)return;

leaveDashboard=r.data||{};

set("pendingCount",leaveDashboard.pending||0);

}

/* Pending Leave */
async function showPendingLeave(){

const box=document.getElementById("leaveList");
if(!box)return;
const r=await apiGet({action:"getLeaveHistory"});
const data=(r.data||[])
.filter(x=>x.status=="Pending");

box.innerHTML=data.map(x=>`

<div class="list-card">
<h3>${x.employee_name||""}</h3>
<p><b>ID:</b> ${x.employee_id}</p>
<p><b>Leave:</b> ${x.leave_type}</p>
<p><b>Date:</b> ${x.start_date} ~ ${x.end_date}</p>
<p><b>Days:</b> ${x.days}</p>
<p><b>Reason:</b> ${x.reason||"-"}</p>
${x.attachment?
`<p><a href="${x.attachment}" target="_blank">📎 View Attachment</a></p>`
:`<p>Attachment : None</p>`}
<p><b>Status:</b> ${x.status}</p>

${["Supervisor","Admin"].includes(getUser().role)?`

<button onclick="approveLeave('${x.leave_id}')">
Approve
</button>

<button onclick="rejectLeave('${x.leave_id}')">
Reject
</button>

`:""}

</div>

`).join("")||"No Pending Leave";

}

async function approveLeave(id){

if(!["Supervisor","Admin"].includes(getUser().role))
return;
const r=await apiPost({action:"approveLeave",leave_id:id});

alert(r.message);

await Promise.all([
showPendingLeave(),
loadLeaveDashboard()
]);

}

async function rejectLeave(id){

if(!["Supervisor","Admin"].includes(getUser().role))
return;
const reason=prompt("Reject reason");
if(!reason)return;
const r=await apiPost({action:"rejectLeave",leave_id:id,reason});

alert(r.message);

await Promise.all([
showPendingLeave(),
loadLeaveDashboard()
]);

}

/* Leave Report */
async function showLeaveReport(){

const box=document.getElementById("leaveList");
if(!box)return;
const r=await apiGet({action:"getLeaveReport"});
const data=r.records||[];
box.innerHTML=data.map(x=>`

<div class="list-card">
<h3>${x.employee_name}</h3>
<p><b>ID:</b> ${x.employee_id}</p>
<p><b>Branch:</b> ${x.branch_name}</p>
<hr>
<p><b>Leave:</b> ${x.leave_type}</p>
<p><b>Date:</b> ${x.start_date} ~ ${x.end_date}</p>
<p><b>Days:</b> ${x.days}</p>
<p><b>Status:</b> ${x.status}</p>
<p><b>Reason:</b> ${x.reason||"-"}</p>

</div>

`).join("")||"No Leave";

}

/* Balance */
async function showBalance(){

const box=document.getElementById("leaveList");
if(!box)return;
const r=await apiGet({action:"getLeaveBalance"});
box.innerHTML=(r.data||[]).map(x=>`

<div class="list-card">
<h3>${x.employee_name||""}</h3>
<p><b>Leave:</b> ${x.leave_type}</p>
<p><b>Entitled:</b> ${x.entitled}</p>
<p><b>Used:</b> ${x.used}</p>
<p><b>Pending:</b> ${x.pending}</p>
<h3>Balance : ${x.balance}</h3>

</div>

`).join("");

}
