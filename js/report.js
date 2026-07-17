let reportType="attendance";
let reportRows=[];
const reportTitle=document.getElementById("reportTitle");
const leaveTabs=document.getElementById("leaveTabs");
const reportResult=document.getElementById("reportResult");
const reportKPI=document.getElementById("reportKPI");
const fromDate=document.getElementById("fromDate");
const toDate=document.getElementById("toDate");
const branchBox=document.getElementById("branchBox");
const employeeBox=document.getElementById("employeeBox");
let currentUser=JSON.parse(localStorage.user||"{}");

/* =====================================================
   INIT
===================================================== */
async function loadReport(){

setDefaultDate();
await buildFilter();
switchReport("attendance");

}

function setDefaultDate(){

let d=new Date();
toDate.value=d.toISOString().slice(0,10);d.setDate(1);
fromDate.value=d.toISOString().slice(0,10);

}

/* =====================================================
   BUILD FILTER
===================================================== */
async function buildFilter(){

branchBox.innerHTML="";
employeeBox.innerHTML="";
let role=currentUser.role;

/* Employee */
if(role!="Employee"){
employeeBox.innerHTML=`
<select id="employeeID">
<option value="">
All Employee
</option>
</select>
`;

await loadEmployeeList();

}

/* Supervisor / Admin */
if(role=="Admin"){
branchBox.innerHTML=`
<select id="branchID">
<option value="ALL">
All Branch
</option>
</select>
`;

await loadBranchList();

}

}

/* =====================================================
   LOAD EMPLOYEE LIST
===================================================== */
async function loadEmployeeList(){

let res=await apiGet({action:"getEmployeeList"});
let box=document.getElementById("employeeID");

if(!box||!res.data)
return;
box.innerHTML=
`
<option value="">
All Employee
</option>
`+
res.data.map(x=>`
<option value="${x.employee_id}">
${x.employee_id} - ${x.name}
</option>
`).join("");

}

/* =====================================================
   LOAD BRANCH LIST
===================================================== */
async function loadBranchList(){

let res=await apiGet({action:"getEmployeeList"});
let map={};
(res.data||[]).forEach(x=>{map[x.branch_id]=true;});

let box=document.getElementById("branchID");
Object.keys(map).forEach(id=>{
box.innerHTML+=`
<option value="${id}">
${id}
</option>
`;

});

}

/* =====================================================
   SWITCH REPORT
===================================================== */
function switchReport(type){

reportType=type;
reportTitle.innerHTML=type=="attendance"
?"Attendance Report":"Leave Report";

if(type=="attendance"){
loadAttendanceReport();
}else{
initLeaveModule();
}

}

/* =====================================================
   SEARCH BUTTON
===================================================== */
async function searchReport(){

if(reportType=="attendance"){
loadAttendanceReport();
}else{
loadLeaveReport();
}

}

/* =====================================================
   ATTENDANCE DASHBOARD
===================================================== */
async function loadAttendanceReport(){

let params={action:"getAttendanceReportDashboard",
from:fromDate.value,
to:toDate.value
};

if(currentUser.role=="Admin"){
params.branch=branchID?.value||"ALL";}

if(currentUser.role!="Employee"){
params.employee=employeeID?.value||"";}

let res=await apiGet(params);

if(!res.success){toast(res.message||"Error");
return;
}

reportRows=res.records||[];
renderAttendanceKPI(res.summary||{});
renderAttendance();

}

/* =====================================================
   ATTENDANCE SUMMARY
===================================================== */
function renderAttendanceKPI(s){

renderKPI([

["Records",s.total],
["Present",s.present],
["Late",s.late],
["Leave",s.leave],
["Absent",s.absent]

].map(x=>({

label:x[0],
value:x[1]||0

})));

}

/* =====================================================
   ATTENDANCE CARD LIST
===================================================== */
function renderAttendance(){

if(!reportRows.length){
reportResult.innerHTML="No Attendance Record";
return;
}

reportResult.innerHTML=
reportRows.map(r=>`

<div class="report-card">
<div class="report-head">
<b>${r.employee_name||""}</b>
<span class="badge ${String(r.status).toLowerCase()}">
${r.status}
</span>

</div>

<div class="report-body">

<p>Date :${r.date}</p>
<p>Branch :${r.branch_name||""}</p>
<p>Check In :${r.checkIn||"-"}</p>
<p>Check Out :${r.checkOut||"-"}</p>
<p>Hours :${r.workHours||0}</p>

</div>

</div>
`).join("");

}

function renderKPI(data){

reportKPI.innerHTML=data.map(x=>`

<div class="kpi-item">
<span>${x.label}</span>
<b>${x.value}</b>
</div>

`).join("");

}

/* =====================================================
   LEAVE MODULE
   PART 2/2
===================================================== */
function initLeaveModule(){

let html="";
if(currentUser.role=="Employee"){

html+=`

<button onclick="loadMyLeave()">
My Leave
</button>

<button onclick="loadLeaveBalance()">
Balance
</button>

`;

}


if(currentUser.role=="Supervisor" ||currentUser.role=="Admin"){
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

loadLeaveDashboard();

}

/* =====================================================
   LEAVE DASHBOARD SUMMARY
===================================================== */
async function loadLeaveDashboard(){

let res=await apiGet({action:"getLeaveDashboard",
from:fromDate.value,
to:toDate.value
});

if(!res.success)
return;

let d=res.data||{};

renderKPI([

["Total",d.total],
["Pending",d.pending],
["Approved",d.approved],
["Rejected",d.rejected],
["Cancelled",d.cancelled]

].map(x=>({

label:x[0],
value:x[1]||0

})));


}

/* =====================================================
   MY LEAVE
===================================================== */
async function loadMyLeave(){

let res=await apiGet({action:"getLeaveHistory"});
let rows=res.data||[];

renderKPI([
  {label:"Total", value:rows.length},
  {label:"Pending", value:rows.filter(x=>x.status=="Pending").length},
  {label:"Approved", value:rows.filter(x=>x.status=="Approved").length},
  {label:"Rejected", value:rows.filter(x=>x.status=="Rejected").length},
  {label:"Cancelled", value:rows.filter(x=>x.status=="Cancelled").length}
]);


renderLeave(rows);

}

/* =====================================================
   PENDING APPROVAL
===================================================== */
async function loadPendingLeave(){

let res=await apiGet({action:"getLeaveHistory"});
let rows=(res.data||[]).filter(x=>x.status=="Pending");

renderPendingLeave(rows);

}

function renderPendingLeave(rows){

reportResult.innerHTML=
rows.map(r=>`

<div class="leave-card">

<b>${r.employee_name}</b>
<p>${r.leave_type}</p>
<p>${r.start_date}~${r.end_date}</p>
<p>Days :${r.days}</p>
<p>${r.reason||""}</p>

<button onclick="approveLeave('${r.leave_id}')">
Approve
</button>

<button onclick="rejectLeave('${r.leave_id}')">
Reject
</button>

</div>
`).join("")||"No Pending Leave";

}

/* =====================================================
   APPROVE
===================================================== */
async function approveLeave(id){

let res=await apiPost({
action:"approveLeave",
leave_id:id
});

toast(res.message);
loadPendingLeave();

}

/* =====================================================
   REJECT
===================================================== */
async function rejectLeave(id){

let reason=prompt("Reject Reason");
let res=await apiPost({
action:"rejectLeave",
leave_id:id,
reason:reason||""
});

toast(res.message);
loadPendingLeave();

}

/* =====================================================
   CANCEL LEAVE
===================================================== */
async function cancelMyLeave(id){

if(!confirm("Cancel this leave?"))
return;

let res=await apiPost({
action:"cancelLeave",
leave_id:id
});

toast(res.message);
loadMyLeave();

}

/* =====================================================
   LEAVE BALANCE
===================================================== */
async function loadLeaveBalance(){

let res=await apiGet({action:"getLeaveBalance"});

renderBalance(res.data||[]);

}

function renderBalance(rows){

reportResult.innerHTML=
rows.map(r=>`
<div class="balance-card">

<b>${r.leave_type}</b>
<p>Entitled :${r.entitled}</p>
<p>Used :${r.used}</p>
<p>Pending :${r.pending}</p>

<h3>Balance :${r.balance}</h3>

</div>
`).join("")||"No Balance";

}

/* =====================================================
   LEAVE REPORT
===================================================== */
async function loadLeaveReport(){

let res=await apiGet({
action:"getLeaveReport",
from:fromDate.value,
to:toDate.value,
employee_id:employeeID?.value||"",
branch:branchID?.value||""
});

renderLeave(
res.records||[]
);

}

function renderLeave(rows){

reportResult.innerHTML=
rows.map(r=>`

<div class="leave-card">

<b>${r.employee_name||""}</b>
<p>Type :${r.leave_type}</p>
<p>Date :${r.start_date}~${r.end_date}</p>
<p>Branch :${r.branch_name||""}</p>
<p>Days :${r.days}</p>
<span class="badge">
${r.status}
</span>
${r.reason?
`<p>${r.reason}</p>`:""}

</div>
`).join("")||"No Leave Record";

}

/* =====================================================
   EXPORT
===================================================== */
async function exportPDF(){

exportFile("PDF");

}

async function exportExcel(){

exportFile("Excel");

}

async function exportCSV(){

exportFile("CSV");

}

async function exportFile(type){

let action="";

if(reportType=="attendance"){

if(type=="PDF")
action="exportAttendancePDF";

if(type=="Excel")
action="exportAttendanceExcel";

if(type=="CSV")
action="exportAttendanceCSV";

}else{

if(type=="PDF")
action="exportLeavePDF";

if(type=="Excel")
action="exportLeaveExcel";

if(type=="CSV")
action="exportLeaveCSV";

}

let params={
action,
from:fromDate.value,
to:toDate.value
};

if(currentUser.role=="Admin"){
params.branch=branchID?.value||"ALL";
}

if(employeeID){
params.employee_id=employeeID.value||"";
}

let res=await apiGet(params);
if(!res)
return;
if(res.url){window.open(res.url);}
else if(res.file){window.open(res.file);}
else{
toast("Export Completed");

}

}
