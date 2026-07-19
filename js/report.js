window.attendanceReport=[];
window.leaveDashboard={};

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

let today=new Intl.DateTimeFormat("en-CA",{
timeZone:"Asia/Kuala_Lumpur"
}).format(new Date());

let r=await apiGet({
action:"getAttendanceReportDashboard",
from:today,
to:today
});

if(!r.success)return;
attendanceReport=r.records||[];
let s=r.summary||{};

presentCount.innerHTML=s.present||0;
lateCount.innerHTML=s.late||0;
absentCount.innerHTML=s.absent||0;
leaveCount.innerHTML=s.leave||0;

}

async function showAttendance(type){

let data=attendanceReport.filter(x=>x.status==type);

attendanceList.innerHTML=
data.map(x=>`

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

let r=await apiGet({action:"getLeaveDashboard"});
if(!r.success)return;
leaveDashboard=r.data||{};
pendingCount.innerHTML=leaveDashboard.pending||0;

}

/* Pending Leave */
async function showPendingLeave(){

let r=await apiGet({action:"getLeaveHistory"});
let data=(r.data||[])
.filter(x=>x.status=="Pending");

leaveList.innerHTML=
data.map(x=>`

<div class="list-card">
<h3>${x.employee_name||""}</h3>
<p><b>ID:</b> ${x.employee_id||"-"}</p>
<p><b>Leave Type:</b> ${x.leave_type}</p>
<p><b>Date:</b>${x.start_date} ~ ${x.end_date}</p>
<p><b>Days:</b>${x.days}</p>
<p><b>Reason:</b>${x.reason||"-"}</p>
${x.attachment?
`
<p><b>Attachment:</b></p>
<a href="${x.attachment}"target="_blank">📎 View Attachment</a>
`
:
`<p><b>Attachment:</b> None</p>`
}

<p><b>Status:</b>${x.status}</p>

${["Supervisor","Admin"].includes(getUser().role)?
`
<button onclick="approveLeave('${x.leave_id}')">
Approve
</button>

<button onclick="rejectLeave('${x.leave_id}')">
Reject
</button>
`
:""
}

</div>

`).join("")||"No Pending Leave";

}

async function approveLeave(id){

let role=getUser().role;
if(!["Supervisor","Admin"].includes(role))
return;
let r=await apiPost({action:"approveLeave",leave_id:id});
alert(r.message);
await Promise.all([
showPendingLeave(),
loadLeaveDashboard()
]);

}

async function rejectLeave(id){

let role=getUser().role;
if(!["Supervisor","Admin"].includes(role))
return;
let reason=prompt("Reject reason");
if(!reason)return;
let r=await apiPost({action:"rejectLeave",leave_id:id,reason});
alert(r.message);
await Promise.all([
showPendingLeave(),
loadLeaveDashboard()
]);

}

/* Leave Report */
async function showLeaveReport(){

let r=await apiGet({action:"getLeaveReport"});
let data=r.records||[];

leaveList.innerHTML=
data.map(x=>`

<div class="list-card">
<h3>${x.employee_name}</h3>
<p>ID:${x.employee_id}</p>
<p>Branch:${x.branch_name}</p>
<hr>
<p>${x.leave_type}</p>
<p>${x.start_date}~${x.end_date}</p>
<p>Days:${x.days}</p>
<p>Status:${x.status}</p>
<p>Reason:${x.reason||"-"}</p>

</div>

`).join("")||"No Leave";

}

/* Balance */
async function showBalance(){

let r=await apiGet({action:"getLeaveBalance"});

leaveList.innerHTML=
(r.data||[]).map(x=>`

<div class="list-card">
<h3>${x.employee_name||""}</h3>
<p>Leave Type:${x.leave_type}</p>
<p>Entitled:${x.entitled}</p>
<p>Used:${x.used}</p>
<p>Pending:${x.pending}</p>
<h3>Balance:${x.balance}</h3>

</div>

`).join("");

}
