let reportType="attendance";
let rows=[];
let exportURL="";
let exporting=false;

const user=JSON.parse(localStorage.user||"{}");
const $=id=>document.getElementById(id);
const reportTitle=$("reportTitle");
const reportKPI=$("reportKPI");
const reportResult=$("reportResult");
const leaveTabs=$("leaveTabs");

/* ================= INIT ================= */
async function loadReport(){

let d=new Date();
$("toDate").value=d.toISOString().slice(0,10);
d.setDate(1);
$("fromDate").value=d.toISOString().slice(0,10);

await buildFilter();
switchReport("attendance");

}

/* ================= FILTER ================= */
async function buildFilter(){

$("branchBox").innerHTML="";
$("employeeBox").innerHTML="";

if(user.role!="Employee"){
$("employeeBox").innerHTML=`

<select id="employeeID">

<option value="">
All Employee
</option>

</select>`;

await loadEmployees();

}

if(user.role=="Admin"){
$("branchBox").innerHTML=`

<select id="branchID">

<option value="ALL">
All Branch
</option>

</select>`;

await loadBranches();

}

}

async function loadEmployees(){

let r=await apiGet({action:"getEmployeeList"});
let box=$("employeeID");

(box&&r.data||[]).forEach(x=>{
box.innerHTML+=`

<option value="${x.employee_id}">
${x.employee_id}-${x.name}
</option>`;

});

}

async function loadBranches(){

let r=await apiGet({action:"getEmployeeList"});
let box=$("branchID");
let map={};

(r.data||[]).forEach(x=>{
map[x.branch_id]=1;
});

Object.keys(map).forEach(x=>{
box.innerHTML+=`

<option value="${x}">
${x}
</option>`;

});

}

/* ================= SWITCH ================= */
function switchReport(type){

reportType=type;

reportTitle.innerHTML=
type=="attendance"
?"Attendance Report"
:"Leave Report";

type=="attendance"
?loadAttendance()
:initLeave();

}

/* ================= SEARCH ================= */
function searchReport(){

reportType=="attendance"
?loadAttendance()
:loadLeaveReport();

}

/* ================= ATTENDANCE ================= */
async function loadAttendance(){

let p={
action:"getAttendanceReportDashboard",
from:$("fromDate").value,
to:$("toDate").value
};

if(user.role=="Admin")
p.branch=$("branchID")?.value||"ALL";
if(user.role!="Employee")
p.employee=$("employeeID")?.value||"";

let r=await apiGet(p);
if(!r.success)
return toast(r.message);

rows=r.records||[];
kpi(r.summary||{});
renderAttendance();

}

function renderAttendance(){

reportResult.innerHTML=
rows.map(r=>`

<div class="report-card">
<b>${r.employee_name||""}</b>
<span class="badge">
${r.status||""}
</span>

<p>Date:${r.date}</p>
<p>Branch:${r.branch_name||""}</p>
<p>${r.checkIn||"-"}-${r.checkOut||"-"}</p>
<p>Hours:${r.workHours||0}</p>

</div>

`).join("")||"No Record";

}

function kpi(s){

let data=[
["Total",s.total],
["Present",s.present],
["Late",s.late],
["Leave",s.leave],
["Absent",s.absent]
];

renderKPI(data);

}

function renderKPI(data){

reportKPI.innerHTML=
data.map(x=>`

<div class="kpi-item">
<span>${x[0]}</span>
<b>${x[1]||0}</b>
</div>

`).join("");

}

/* ================= LEAVE ================= */
function initLeave(){

let h="";
if(user.role=="Employee"){
h+=`

<button onclick="loadMyLeave()">
My Leave
</button>

<button onclick="loadBalance()">
Balance
</button>

`;

}

if(user.role!="Employee"){
h+=`

<button onclick="loadPendingLeave()">
Pending
</button>

<button onclick="loadLeaveReport()">
Report
</button>

<button onclick="loadBalance()">
Balance
</button>

`;

}

leaveTabs.innerHTML=h;
loadLeaveDashboard();

}

async function loadLeaveDashboard(){

let r=await apiGet({

action:"getLeaveDashboard",
from:$("fromDate").value,
to:$("toDate").value

});

if(r.success){
let d=r.data||{};
renderKPI([

["Total",d.total],
["Pending",d.pending],
["Approved",d.approved],
["Rejected",d.rejected],
["Cancelled",d.cancelled]

]);

}

}

/* ================= MY LEAVE ================= */
async function loadMyLeave(){

let r=await apiGet({action:"getLeaveHistory"});
let data=r.data||[];

renderKPI([

["Total",data.length],

["Pending",data.filter(x=>x.status=="Pending").length],

["Approved",data.filter(x=>x.status=="Approved").length],

["Rejected",data.filter(x=>x.status=="Rejected").length]

]);

renderLeave(data);

}

/* ================= LEAVE REPORT ================= */
async function loadLeaveReport(){

let r=await apiGet({

action:"getLeaveReport",
from:$("fromDate").value,
to:$("toDate").value,
employee_id:$("employeeID")?.value||"",
branch:$("branchID")?.value||""

});

renderLeave(r.records||[]);

}

function renderLeave(data){

reportResult.innerHTML=
data.map(r=>`

<div class="leave-card">

<b>${r.employee_name||""}</b>
<p>${r.leave_type}</p>
<p>${r.start_date}~${r.end_date}</p>
<p>Days:${r.days}</p>
<span>${r.status}</span>

</div>

`).join("")||"No Leave";

}

/* ================= APPROVAL ================= */
async function loadPendingLeave(){

let r=await apiGet({action:"getLeaveHistory"});
let data=(r.data||[])
.filter(x=>x.status=="Pending");

reportResult.innerHTML=
data.map(x=>`

<div class="leave-card">
<b>${x.employee_name}</b>
<p>${x.leave_type}</p>
<p>${x.start_date} ~ ${x.end_date}</p>

<button onclick="approveLeave('${x.leave_id}')">
Approve
</button>

<button onclick="rejectLeave('${x.leave_id}')">
Reject
</button>

</div>

`).join("")||"No Pending";

}

async function approveLeave(id){

let r=await apiPost({
action:"approveLeave",
leave_id:id
});

toast(r.message);loadPendingLeave();}

async function rejectLeave(id){

let reason=prompt("Reason");
let r=await apiPost({
action:"rejectLeave",
leave_id:id,
reason
});

toast(r.message);loadPendingLeave();}

/* ================= BALANCE ================= */
async function loadBalance(){

let r=await apiGet({action:"getLeaveBalance"});

reportResult.innerHTML=
(r.data||[]).map(x=>`

<div class="balance-card">
<b>${x.leave_type}</b>
<p>Used:${x.used}</p>

<h3>Balance:${x.balance}</h3>

</div>

`).join("");

}

/* ================= EXPORT ================= */
function exportPDF(){exportReport("PDF");}

function exportExcel(){exportReport("Excel");}

function exportCSV(){exportReport("CSV");}

async function exportReport(type){

if(exporting)
return;

exporting=true;
showExportLoading();

let action=reportType=="attendance"
?
"exportAttendance"+type
:
"exportLeave"+type;

try{
let res=await apiGet({
action,
from:$("fromDate").value,
to:$("toDate").value,
branch:$("branchID")?.value||"",
employee_id:$("employeeID")?.value||""
});

if(res.success){
let data=res.data||res;
exportURL=data.url||data.file||"";
showExportDone(data.name||data.filename||"Report");
}

else{
toast(res.message||"Export Failed");
hideExport();
}

}catch(e){
toast("Network Error");
hideExport();
}

exporting=false;

}

function showExportLoading(){

$("exportModal").style.display="flex";
$("exportLoading").style.display="block";
$("exportDone").style.display="none";

}

function showExportDone(name){

$("exportLoading").style.display="none";
$("exportDone").style.display="block";
$("exportFileName")
.innerHTML=name;

}

function hideExport(){
$("exportModal").style.display="none";
}

function openExportFile(){

if(exportURL){window.open(exportURL);}
hideExport();
  
}
