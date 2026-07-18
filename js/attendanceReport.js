window.attUser=JSON.parse(localStorage.user||"{}");
window.attendanceRows=[];
window.att$=id=>document.getElementById(id);

function attEl(id){
return document.getElementById(id);
}

async function loadAttendanceReport(){

let d=new Date();

att$("toDate").value=d.toISOString().slice(0,10);
d.setDate(1);
att$("fromDate").value=d.toISOString().slice(0,10);

await buildAttendanceFilter();
attendanceRows=[];
renderKPI({});

att$("attendanceResult").innerHTML=`
<div class="empty-report">
Select Filter and press Search
</div>`;

}

/* FILTER */
async function buildAttendanceFilter(){

if(attUser.role!="Employee"){
employeeBox.innerHTML=`
<select id="employeeID">
<option value="">
All Employee
</option>
</select>`;

await loadEmployees();

}

if(attUser.role=="Admin"){
branchBox.innerHTML=`
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
let box=att$("employeeID");
(r.data||[]).forEach(x=>{
box.innerHTML+=`
<option value="${x.employee_id}">
${x.employee_id} - ${x.name}
</option>`;
});

}

async function loadBranches(){

let r=await apiGet({action:"getEmployeeList"});
let map={};
(r.data||[]).forEach(x=>{
map[x.branch_id]=1;
});

let box=att$("branchID");

Object.keys(map).forEach(x=>{
box.innerHTML+=`
<option value="${x}">
${x}
</option>`;
});

}

/* LOAD DATA */
async function searchAttendance(){

let p={
action:"getAttendanceReportDashboard",
from:att$("fromDate").value,
to:att$("toDate").value
};

if(attUser.role=="Admin")
p.branch=att$("branchID")?.value||"ALL";

if(attUser.role!="Employee")
p.employee=att$("employeeID")?.value||"";

let r=await apiGet(p);
if(!r.success)
return;

attendanceRows=r.records||[];
renderKPI(r.summary||{});
renderAttendance();

}

/* KPI */

function renderKPI(s){

attEl("reportKPI").innerHTML=`

<div class="mini-card">
<span>Total</span>
<b>${s.total||0}</b>
</div>

<div class="mini-card">
<span>Present</span>
<b>${s.present||0}</b>
</div>

<div class="mini-card">
<span>Late</span>
<b>${s.late||0}</b>
</div>

<div class="mini-card">
<span>Absent</span>
<b>${s.absent||0}</b>
</div>

<div class="mini-card">
<span>Leave</span>
<b>${s.leave||0}</b>
</div>

`;

}

/* LIST */
function renderAttendance(data=attendanceRows){

attEl("attendanceResult").innerHTML=`
<table class="attendance-table">

<thead>

<tr>

<th>Date</th>
<th>Employee</th>
<th>ID</th>
<th>Branch</th>
<th>Check In</th>
<th>Check Out</th>
<th>Status</th>

</tr>

</thead>


<tbody>

${data.map(x=>`
<tr>

<td>${x.date||"-"}</td>

<td>${x.employee_name||"-"}</td>
<td>${x.employee_id||"-"}</td>
<td>${x.branch_name||"-"}</td>
<td>${x.checkIn||"--"}</td>
<td>${x.checkOut||"--"}</td>
<td>
<span class="badge">
${x.status||"-"}
</span>
</td>

</tr>
`).join("")}

</tbody>

</table>
`||"No Record";

}

/* EXPORT */
async function exportAttendance(type){

const action={
PDF:"exportReportPDF",
Excel:"exportReportExcel",
CSV:"exportReportCSV"
}[type];

const r=await apiGet({
action,
type:"attendance",
from:att$("fromDate").value,
to:att$("toDate").value,
branch:att$("branchID")?.value||"ALL",
employee:att$("employeeID")?.value||""
});

if(r.success){

const url=r.downloadUrl;
if(url)
window.open(url,"_blank");

}else{alert(r.message||"Export Failed");}

}
