const user=JSON.parse(localStorage.user||"{}");
let attendanceRows=[];
const $=id=>document.getElementById(id);

async function loadAttendanceReport(){

let d=new Date();

$("toDate").value=d.toISOString().slice(0,10);
d.setDate(1);
$("fromDate").value=d.toISOString().slice(0,10);

await buildAttendanceFilter();
searchAttendance();

}

/* =====================
FILTER
===================== */
async function buildAttendanceFilter(){

if(user.role!="Employee"){
employeeBox.innerHTML=`

<select id="employeeID">

<option value="">
All Employee
</option>

</select>

`;
loadEmployees();
}

if(user.role=="Admin"){
branchBox.innerHTML=`

<select id="branchID">

<option value="ALL">
All Branch
</option>

</select>

`;
loadBranches();
}

}

async function loadEmployees(){

let r=await apiGet({action:"getEmployeeList"});
let box=$("employeeID");

(r.data||[])
.forEach(x=>{box.innerHTML+=`

<option value="${x.employee_id}">
${x.employee_id} -
${x.name}
</option>

`;

});

}

async function loadBranches(){

let r=await apiGet({action:"getEmployeeList"});
let map={};
(r.data||[])
.forEach(x=>{map[x.branch_id]=1;});

let box=$("branchID");
Object.keys(map)
.forEach(x=>{box.innerHTML+=`
<option value="${x}">
${x}
</option>
`;

});

}

/* =====================
LOAD DATA
===================== */
async function searchAttendance(){

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
if(!r.success)return;

attendanceRows=r.records||[];
renderKPI(r.summary||{});
renderAttendance();

}

/* =====================
KPI
===================== */
function renderKPI(s){

reportKPI.innerHTML=`

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

/* =====================
LIST
===================== */
function renderAttendance(){

attendanceResult.innerHTML=attendanceRows.map(x=>`

<div class="list-card">
<b>${x.employee_name||""}</b>
<p>ID :${x.employee_id||""}</p>
<p>Date :${x.date||""}</p>
<p>Branch :${x.branch_name||""}</p>
<p>${x.checkIn||"--:--"}-${x.checkOut||"--:--"}</p>

<span class="badge">
${x.status||""}
</span>

</div>

`).join("")||"No Attendance Record";

}

/* =====================
EXPORT
===================== */
async function exportAttendance(type){

let action="exportAttendance"+type;
let r=await apiGet({
action,
from:$("fromDate").value,
to:$("toDate").value,
branch:$("branchID")?.value||"",
employee_id:$("employeeID")?.value||""
});

if(r.success){
let url=r.data?.url||r.url;
if(url)
window.open(url);
}

else{alert(r.message||"Export Failed");}

}
