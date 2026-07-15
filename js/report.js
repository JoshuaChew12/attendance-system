let reportRows=[];
let reportType="attendance";

async function loadReport(){

const user=JSON.parse(localStorage.user||"{}");

if(user.role!="Employee")
employeeBox.innerHTML=
`<input id="employeeID" placeholder="Employee ID">`;


let d=new Date();

toDate.value=d.toISOString().slice(0,10);
d.setDate(1);
fromDate.value=d.toISOString().slice(0,10);

switchReport("attendance");

}

function switchReport(type){

reportType=type;

attendanceMode.style.display=
type=="attendance"?"block":"none";

leaveMode.style.display=
type=="leave"?"block":"none";

reportTitle.innerHTML=
type=="attendance"
?"Attendance Report"
:"Leave Report";

if(type=="attendance")
searchReport();
else{
initLeaveModule();
loadMyLeave();
}

}

// ===============================
// ATTENDANCE
// ===============================
async function searchReport(){

const res=await apiGet({
action:"getReport",
from:fromDate.value,
to:toDate.value,
employee:
window.employeeID?
employeeID.value:""
});

reportRows=
(res.records||[])
.sort((a,b)=>b.date.localeCompare(a.date));

updateAttendanceSummary();
renderAttendance();

}

function updateAttendanceSummary(){

let p=0,l=0,h=0;

reportRows.forEach(r=>{

if(r.status=="Present")p++;
if(r.status=="Late"){
p++;
l++;
}

h+=Number(r.workHours)||0;

});

setSummary(
"Present",
"Late",
"Total Hours",
"Average",
p,l,h.toFixed(2),
p?(h/p).toFixed(2):0
);

}

function renderAttendance(){

if(!reportRows.length){
reportResult.innerHTML="No Record";
return;
}

reportResult.innerHTML=
reportRows.map((r,i)=>`

<div class="report-card">

<div class="report-head"
onclick="toggleReport(${i})">

<b>${r.date}</b>

<span class="badge ${r.status.toLowerCase()}">
${r.status}
</span>

</div>


<div id="detail${i}" style="display:none">

<p>Check In : ${r.checkIn}</p>
<p>Check Out : ${r.checkOut}</p>
<p>Hours : ${r.workHours}</p>
<p>Late : ${r.lateMinutes} mins</p>
<p>Early : ${r.earlyLeave} mins</p>

</div>

</div>

`).join("");

}

// ===============================
// ENTERPRISE LEAVE MODULE
// ===============================
let currentLeaveMode="";

function initLeaveModule(){

const user=JSON.parse(localStorage.user||"{}");
let html="";
if(user.role=="Employee"){
html+=`
<button onclick="loadMyLeave()">
My Leave
</button>

<button onclick="loadLeaveBalance()">
Balance
</button>
`;
}

if(user.role=="Supervisor" ||user.role=="Admin"){
html+=`
<button onclick="loadPendingLeave()">
Pending Approval
</button>

<button onclick="loadLeaveReport()">
Leave Report
</button>

<button onclick="loadLeaveBalance()">
Balance
</button>
`;
}

leaveTabs.innerHTML=html;

}

async function loadMyLeave(){

const res=await apiGet({action:"getLeaveHistory"});
const rows=res.data||[];

setSummary(
"Total",
"Pending",
"Approved",
"Rejected",
rows.length,
rows.filter(x=>x.status=="Pending").length,
rows.filter(x=>x.status=="Approved").length,
rows.filter(x=>x.status=="Rejected").length
);

reportResult.innerHTML=
rows.map(r=>`
<div class="leave-card">
<b>${r.leave_type}</b>

<p>${r.start_date}~${r.end_date}</p>
<p>Days :${r.days}</p>
<span class="badge">${r.status}</span>
<p>${r.reason||""}</p>

${(r.status=="Pending"||r.status=="Approved")?
`
<button
onclick="cancelMyLeave('${r.leave_id}')">
Cancel
</button>
`
:""
}

</div>`).join("")||"No Leave";

}

async function cancelMyLeave(id){

if(!confirm("Cancel this leave?"))
return;

const r=await apiPost({
action:"cancelLeave",
leave_id:id
});

toast(r.message);
loadMyLeave();

}

async function loadPendingLeave(){

const r=await apiGet({
action:"getLeaveHistory"
});

const user=JSON.parse(localStorage.user);
let rows=r.data||[];

rows=rows.filter(x=>x.status=="Pending");

renderPendingLeave(rows);

}

function renderPendingLeave(rows){

reportResult.innerHTML=
rows.map(x=>`
<div class="leave-card">
<b>${x.employee_name}</b>

<p>${x.leave_type}</p>
<p>${x.start_date}~${x.end_date}</p>
<p>Days:${x.days}</p>

<button
onclick="approveLeave('${x.leave_id}')">
Approve
</button>

<button
onclick="rejectLeave('${x.leave_id}')">
Reject
</button>

</div>
`).join("")||"No Pending Leave";

}

async function approveLeave(id){

const r=await apiPost({
action:"approveLeave",
leave_id:id
});

toast(r.message);

loadPendingLeave();

}

async function rejectLeave(id){

let reason=prompt("Reject Reason");

const r=await apiPost({
action:"rejectLeave",
leave_id:id,
reason
});

toast(r.message);

loadPendingLeave();

}

async function loadLeaveBalance(){

const r=await apiGet({
action:"getLeaveBalance"
});

renderLeaveBalance(r.data||[]);

}

function renderLeaveBalance(rows){

reportResult.innerHTML=
rows.map(x=>`
<div class="balance-card">
<b>${x.leave_type}</b>

<p>Entitled :${x.entitled}
<br>
Used :${x.used}
<br>
Pending :${x.pending}
<br>
Balance :<strong>${x.balance}</strong>
</p>
</div>
`).join("")||"No Balance";

}

async function loadLeaveReport(){

const r=await apiGet({
action:"getLeaveReport",
from:
fromDate.value||"",

to:
toDate.value||""
});

renderLeaveReport(r.records||[]);

}

function renderLeaveReport(rows){

reportResult.innerHTML=
rows.map(r=>`
<div class="leave-card">

<b>${r.employee_name}</b>
<p>${r.leave_type}</p>
<p>${r.start_date}~${r.end_date}</p>
<p>Branch:${r.branch_name}</p>
<p>Status:${r.status}</p>

</div>

`).join("")||"No Record";

}

// ===============================
// COMMON
// ===============================
function setSummary(a,b,c,d,x,y,z,w){

s1.innerHTML=a;
s2.innerHTML=b;
s3.innerHTML=c;
s4.innerHTML=d;

sum1.innerHTML=x;
sum2.innerHTML=y;
sum3.innerHTML=z;
sum4.innerHTML=w;

}

function toggleReport(i){

let d=document.getElementById("detail"+i);

d.style.display=
d.style.display=="none"
?"block":"none";

}

function exportCSV(){

if(!reportRows.length)return;

let csv=
"Date,Status,CheckIn,CheckOut,Hours,Late,Early\n";

reportRows.forEach(r=>{

csv+=
`${r.date},${r.status},${r.checkIn},${r.checkOut},${r.workHours},${r.lateMinutes},${r.earlyLeave}\n`;

});


let a=document.createElement("a");

a.href=
URL.createObjectURL(
new Blob([csv])
);

a.download="AttendanceReport.csv";

a.click();

}
