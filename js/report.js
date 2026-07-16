let reportType="attendance";
let reportRows=[];

async function loadReport(){

const user=JSON.parse(localStorage.user||"{}");
initReportFilter(user);
switchReport("attendance");

}

function initReportFilter(user){

let today=new Date();

toDate.value=today.toISOString().slice(0,10);
today.setDate(1);
fromDate.value=today.toISOString().slice(0,10);

if(user.role=="Employee"){
if(employeeID)
employeeID.style.display="none";
if(branchFilter)
branchFilter.style.display="none";
}

else{loadBranchOption();}

}

function switchReport(type){

reportType=type;
attendanceMode.style.display=
type=="attendance"?"block":"none";

leaveMode.style.display=
type=="leave"?"block":"none";

reportTitle.innerHTML=
type=="attendance"?"Attendance Report":"Leave Report";
if(type=="attendance")

loadAttendanceDashboard();
else
initLeaveModule();

}

async function loadAttendanceDashboard(){

const res=await apiGet({
action:"getAttendanceReportDashboard",
from:fromDate.value,
to:toDate.value,
employee:employeeID?.value||"",
branch:branchFilter?.value||""
});

if(!res)
return;

reportRows=res.records||[];
renderAttendanceSummary(
res.summary||{}
);
renderAttendance();

}

function renderAttendanceSummary(s){

setSummary(
"Present",
"Late",
"Leave",
"Holiday",

s.present||0,
s.late||0,
s.leave||0,
s.holiday||0
);

if(document.getElementById("s5")){
s5.innerHTML="Weekly Off";
sum5.innerHTML=s.weekly_off||0;

s6.innerHTML="Absent";
sum6.innerHTML=s.absent||0;
}

}

function renderAttendance(){

if(!reportRows.length){
reportResult.innerHTML="No Record";
return;
}

reportResult.innerHTML=reportRows.map(r=>`
<div class="report-card">
<div>
<b>${r.employee_name}</b>
<p>${r.date}</p>
<span class="badge">${r.status}</span>
<p>Branch:${r.branch_name}</p>
</div>
</div>
`).join("");

}

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

else{html+=`
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
loadMyLeave();

}

async function loadMyLeave(){

const r=await apiGet({
action:"getLeaveHistory"});
let rows=r.data||[];
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

renderLeave(rows);

}

async function loadPendingLeave(){

const r=await apiGet({
action:"getLeaveHistory"});
let rows=(r.data||[]).filter(x=>x.status=="Pending");
renderPendingLeave(rows);

}

function renderPendingLeave(rows){

reportResult.innerHTML=rows.map(r=>`
<div class="leave-card">
<b>${r.employee_name}</b>
<p>${r.leave_type}</p>
<p>${r.start_date}~${r.end_date}</p>
<p>Days:${r.days}</p>

<button
onclick="approveLeave('${r.leave_id}')">
Approve
</button>

<button
onclick="rejectLeave('${r.leave_id}')">
Reject
</button>

</div>
`).join("")||"No Pending Leave";

}

async function approveLeave(id){

let r=await apiPost({
action:"approveLeave",
leave_id:id
});

toast(r.message);
loadPendingLeave();
  
}

async function rejectLeave(id){

let reason=prompt("Reject Reason");
let r=await apiPost({
action:"rejectLeave",
leave_id:id,
reason
});

toast(r.message);
loadPendingLeave();

}

async function loadLeaveReport(){

const r=await apiGet({
action:"getLeaveDashboard",
from:fromDate.value,
to:toDate.value,
employee:employeeID?.value||"",
branch:branchFilter?.value||""
});

renderLeave(r.records||[]);

}

function renderLeave(rows){

reportResult.innerHTML=rows.map(r=>`
<div class="leave-card">
<b>${r.employee_name||""}</b>
<p>${r.leave_type}</p>
<p>${r.start_date}~${r.end_date}</p>
<p>Branch:${r.branch_name||""}</p>
<span>${r.status}</span>
</div>
`).join("")||"No Record";

}

async function loadLeaveBalance(){

const r=await apiGet({
action:"getLeaveBalance"});

reportResult.innerHTML=
(r.data||[]).map(x=>`
<div class="balance-card">
<b>${x.leave_type}</b>
<p>Entitled:${x.entitled}</p>
<p>Used:${x.used}</p>
<p>Balance:${x.balance}</p>
</div>
`).join("");

}

async function loadBranchOption(){

if(!branchFilter)
return;
const r=await apiGet({
action:"getBranches"});

branchFilter.innerHTML=
`
<option value="">
All Branch
</option>
`;

(r.data||[]).forEach(b=>{
branchFilter.innerHTML+=
`
<option value="${b.branch_id}">
${b.name}
</option>
`;

});

}

function downloadReport(type){

if(reportType=="attendance"){
if(type=="PDF")
exportAttendancePDF();
if(type=="EXCEL")
exportAttendanceExcel();
if(type=="CSV")
exportAttendanceCSV();
}

else{

if(type=="PDF")
exportLeavePDF();
if(type=="EXCEL")
exportLeaveExcel();
if(type=="CSV")
exportLeaveCSV();

}

}

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
