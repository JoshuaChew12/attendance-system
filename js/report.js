const user=JSON.parse(localStorage.user||"{}");

const $=x=>document.getElementById(x);

async function loadReport(){
loadAttendanceDashboard();
loadLeaveDashboard();
}

/* =========================
 ATTENDANCE DASHBOARD
========================= */
async function loadAttendanceDashboard(){

let r=await apiGet({action:"getAttendanceReportDashboard"});
if(!r.success)return;

let s=r.summary||{};
presentCount.innerHTML=s.present||0;
lateCount.innerHTML=s.late||0;
absentCount.innerHTML=s.absent||0;
leaveCount.innerHTML=s.leave||0;

}

async function showAttendance(type){

let r=await apiGet({action:"getAttendanceReportDashboard"});
let data=(r.records||[]).filter(x=>x.status==type);

attendanceList.innerHTML=
data.map(x=>`

<div class="list-card">
<b>${x.employee_name}</b>
<p>${x.employee_id}</p>
<p>${x.branch_name||""}</p>
<p>${x.status}</p>

</div>

`).join("")||"No Record";

}

/* =========================
 LEAVE DASHBOARD
========================= */
async function loadLeaveDashboard(){

let r=await apiGet({action:"getLeaveDashboard"});
if(!r.success)return;

let d=r.data||{};
pendingCount.innerHTML=d.pending||0;

}

/* Pending Leave */
async function showPendingLeave(){

let r=await apiGet({action:"getLeaveHistory"});
let data=(r.data||[])
.filter(x=>x.status=="Pending");

leaveList.innerHTML=
data.map(x=>`

<div class="list-card">
<b>${x.employee_name||""}</b>
<p>${x.leave_type}</p>
<p>${x.start_date}~${x.end_date}</p>
<p>Days:${x.days}</p>

${user.role!="Employee"?
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

let r=await apiPost({action:"approveLeave",leave_id:id});
alert(r.message);
showPendingLeave();

}

async function rejectLeave(id){

let reason=prompt("Reject reason");
let r=await apiPost({action:"rejectLeave",leave_id:id,reason});
alert(r.message);
showPendingLeave();

}

/* Leave Report */
async function showLeaveReport(){

let r=await apiGet({action:"getLeaveReport"});
let data=r.records||[];

leaveList.innerHTML=
data.map(x=>`

<div class="list-card">
<b>${x.employee_name}</b>
<p>${x.leave_type}</p>
<p>${x.start_date}~${x.end_date}</p>
<span>${x.status}</span>

</div>

`).join("")||"No Leave";

}

/* Balance */
async function showBalance(){

let r=await apiGet({action:"getLeaveBalance"});

leaveList.innerHTML=
(r.data||[]).map(x=>`

<div class="list-card">
<b>${x.leave_type}</b>
<p>Used : ${x.used}</p>

<h3>Balance : ${x.balance}</h3>

</div>

`).join("");

}
