/* =====================================================
   REPORT ENGINE V4 ENTERPRISE COMPACT
===================================================== */

let reportType="attendance";
let reportRows=[];
let reportUser={};


/* =====================================================
   INIT
===================================================== */

async function loadReport(){

reportUser=
JSON.parse(localStorage.user||"{}");

initFilter();

switchReport("attendance");

}


/* =====================================================
   FILTER INIT
===================================================== */

function initFilter(){

let role=reportUser.role||"";

let d=new Date();

toDate.value=
d.toISOString().slice(0,10);

d.setDate(1);

fromDate.value=
d.toISOString().slice(0,10);



/* Employee */

employeeBox.innerHTML=
role=="Employee"
?""
:
`<input id="employeeID"
placeholder="Employee ID">`;



/* Branch */

if(role=="Admin"){

branchBox.innerHTML=
`<select id="branchID">
<option value="ALL">
ALL BRANCH
</option>
</select>`;

loadBranchOption();

}

else if(role=="Supervisor"){

branchBox.innerHTML=
`<input value="${reportUser.branch_id||""}" readonly>`;

}

else{

branchBox.innerHTML="";

}

}



/* =====================================================
   LOAD BRANCH
===================================================== */

async function loadBranchOption(){

const r=
await apiGet({
action:"getBranches"
});


branchID.innerHTML=
`
<option value="ALL">
ALL BRANCH
</option>
`+
(r.data||[])
.map(b=>
`
<option value="${b.branch_id}">
${b.name}
</option>
`
).join("");

}



/* =====================================================
   SWITCH
===================================================== */

function switchReport(type){

reportType=type;


attendanceMode.style.display=
type=="attendance"
?"block":"none";


leaveMode.style.display=
type=="leave"
?"block":"none";


reportTitle.innerHTML=
type=="attendance"
?
"Attendance Report"
:
"Leave Report";



if(type=="attendance"){

loadAttendanceDashboard();

}

else{

initLeaveModule();

}

}

/* =====================================================
   ATTENDANCE DASHBOARD
===================================================== */


async function loadAttendanceDashboard(){

let p={
action:"getAttendanceReportDashboard",
from:fromDate.value,
to:toDate.value
};

addFilter(p);


const r=
await apiGet(p);


let d=r.data||{};


presentCount.innerHTML=d.present||0;

lateCount.innerHTML=d.late||0;

leaveCount.innerHTML=d.leave||0;

holidayCount.innerHTML=d.holiday||0;

weeklyOffCount.innerHTML=d.weeklyOff||0;

absentCount.innerHTML=d.absent||0;

}



/* =====================================================
   FILTER BUILDER
===================================================== */

function addFilter(p){

if(employeeID)
p.employee=
employeeID.value||"";


if(branchID)
p.branch=
branchID.value||"";

}



/* =====================================================
   SEARCH
===================================================== */

async function searchReport(){

if(reportType=="attendance")
await loadAttendance();

else
await loadLeaveReport();

}



/* =====================================================
   ATTENDANCE RECORD
===================================================== */

async function loadAttendance(){

let p={
action:"getReport",
from:fromDate.value,
to:toDate.value
};


addFilter(p);


const r=
await apiGet(p);


reportRows=
r.records||[];


renderAttendance();

}



/* =====================================================
   RENDER
===================================================== */

function renderAttendance(){

if(!reportRows.length){

reportResult.innerHTML=
"No Record";

return;

}


reportResult.innerHTML=
reportRows.map(r=>`

<div class="report-card">

<b>
${r.employee_name||""}
</b>

<p>
${r.date||""}
</p>

<p>
Branch :
${r.working_branch_name||""}
</p>

<p>
Status :
<span class="badge">
${r.status||""}
</span>
</p>


<p>
Check In :
${r.checkIn||"-"}
</p>


<p>
Check Out :
${r.checkOut||"-"}
</p>


<p>
Hours :
${r.workHours||0}
</p>


</div>

`).join("");

}

/* =====================================================
   LEAVE MODULE
===================================================== */


function initLeaveModule(){

let r=reportUser.role;
let html="";


if(r=="Employee"){

html+=`

<button onclick="loadMyLeave()">
My Leave
</button>

<button onclick="loadLeaveBalance()">
Balance
</button>

`;

}


if(r=="Supervisor"||r=="Admin"){

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


if(r=="Employee")
loadMyLeave();

}



/* =====================================================
   MY LEAVE
===================================================== */


async function loadMyLeave(){

const r=
await apiGet({
action:"getLeaveHistory"
});


let rows=r.data||[];


setLeaveSummary(rows);


renderLeave(rows);

}



/* =====================================================
   PENDING APPROVAL
===================================================== */


async function loadPendingLeave(){

const r=
await apiGet({

action:"getLeaveReport",

from:fromDate.value,

to:toDate.value

});


let rows=
(r.records||[])
.filter(x=>x.status=="Pending");


setLeaveSummary(rows);

renderPendingLeave(rows);

}



/* =====================================================
   LEAVE SUMMARY
===================================================== */


function setLeaveSummary(rows){

sum1.innerHTML=
rows.length;

sum2.innerHTML=
rows.filter(x=>x.status=="Pending").length;

sum3.innerHTML=
rows.filter(x=>x.status=="Approved").length;

sum4.innerHTML=
rows.filter(x=>x.status=="Rejected").length;


s1.innerHTML="Total";

s2.innerHTML="Pending";

s3.innerHTML="Approved";

s4.innerHTML="Rejected";

}



/* =====================================================
   APPROVE / REJECT
===================================================== */


async function approveLeave(id){

let r=
await apiPost({

action:"approveLeave",

leave_id:id

});


toast(r.message);

loadPendingLeave();

}



async function rejectLeave(id){

let reason=
prompt("Reject Reason");


let r=
await apiPost({

action:"rejectLeave",

leave_id:id,

reason

});


toast(r.message);

loadPendingLeave();

}



/* =====================================================
   LEAVE REPORT
===================================================== */


async function loadLeaveReport(){

let p={

action:"getLeaveReport",

from:fromDate.value,

to:toDate.value

};


addFilter(p);


const r=
await apiGet(p);


let rows=
r.records||[];


setLeaveSummary(rows);

renderLeave(rows);

}



/* =====================================================
   BALANCE
===================================================== */


async function loadLeaveBalance(){

const r=
await apiGet({

action:"getLeaveBalance"

});


renderBalance(r.data||[]);

}



/* =====================================================
   RENDER LEAVE
===================================================== */


function renderLeave(rows){

reportResult.innerHTML=
rows.map(r=>`

<div class="leave-card">

<b>
${r.employee_name||""}
</b>


<p>
${r.leave_type||""}
</p>


<p>
${r.start_date}
~
${r.end_date}
</p>


<p>
Days :
${r.days||0}
</p>


<p>
Status :
<span class="badge">
${r.status}
</span>
</p>


</div>

`).join("")||"No Record";

}



/* =====================================================
   RENDER PENDING
===================================================== */


function renderPendingLeave(rows){

reportResult.innerHTML=
rows.map(r=>`

<div class="leave-card">

<b>
${r.employee_name}
</b>


<p>
${r.leave_type}
</p>


<p>
${r.start_date}
~
${r.end_date}
</p>


<p>
Days :
${r.days}
</p>


<button onclick="
approveLeave('${r.leave_id}')
">
Approve
</button>


<button onclick="
rejectLeave('${r.leave_id}')
">
Reject
</button>


</div>

`).join("")||"No Pending Leave";

}



/* =====================================================
   RENDER BALANCE
===================================================== */


function renderBalance(rows){

reportResult.innerHTML=
rows.map(r=>`

<div class="balance-card">

<b>
${r.leave_type}
</b>


<p>
Entitled :
${r.entitled}
</p>

<p>
Used :
${r.used}
</p>

<p>
Pending :
${r.pending}
</p>


<p>
Balance :
<strong>
${r.balance}
</strong>
</p>


</div>

`).join("")||"No Balance";

}

/* =====================================================
   EXPORT ENGINE
===================================================== */


function buildExportParams(){

let p={

from:
fromDate.value,

to:
toDate.value

};


if(employeeID)
p.employee=
employeeID.value||"";


if(branchID)
p.branch=
branchID.value||"";


return p;

}



/* =====================================================
   RUN EXPORT
===================================================== */


async function runExport(action){

let p=
buildExportParams();


p.action=
action;


const r=
await apiGet(p);


if(!r){

toast("Export Failed");

return;

}



if(r.url){

window.open(
r.url,
"_blank"
);

return;

}



if(r.file){

let a=
document.createElement("a");

a.href=r.file;

a.download=
r.filename||"Report";

a.click();

return;

}



toast(
r.message||
"Export Completed"
);

}



/* =====================================================
   ATTENDANCE EXPORT
===================================================== */


function exportAttendancePDF(){

runExport(
"exportAttendancePDF"
);

}



function exportAttendanceExcel(){

runExport(
"exportAttendanceExcel"
);

}



function exportAttendanceCSV(){

runExport(
"exportAttendanceCSV"
);

}



/* =====================================================
   LEAVE EXPORT
===================================================== */


function exportLeavePDF(){

runExport(
"exportLeavePDF"
);

}



function exportLeaveExcel(){

runExport(
"exportLeaveExcel"
);

}



function exportLeaveCSV(){

runExport(
"exportLeaveCSV"
);

}



/* =====================================================
   BUTTON ROUTER
===================================================== */


function exportPDF(){

reportType=="attendance"
?
exportAttendancePDF()
:
exportLeavePDF();

}



function exportExcel(){

reportType=="attendance"
?
exportAttendanceExcel()
:
exportLeaveExcel();

}



function exportCSV(){

reportType=="attendance"
?
exportAttendanceCSV()
:
exportLeaveCSV();

}
