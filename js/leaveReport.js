window.leaveUser=JSON.parse(localStorage.user||"{}");
window.leaveRows=[];
const leave$=id=>document.getElementById(id);

async function loadLeaveReport(){

let d=new Date();

leave$("toDate").value=d.toISOString().slice(0,10);
d.setDate(1);
leave$("fromDate").value=d.toISOString().slice(0,10);

await buildLeaveFilter();

renderLeaveKPI({});
leaveRows=[];

}

async function buildLeaveFilter(){

if(leaveUser.role!="Employee"){

employeeBox.innerHTML=`
<select id="employeeID">
<option value="">All Employee</option>
</select>`;

let r=await apiGet({action:"getEmployeeList"});
(r.data||[]).forEach(x=>{
employeeID.innerHTML+=`
<option value="${x.employee_id}">
${x.employee_id} - ${x.name}
</option>`;
});

}

if(leaveUser.role=="Admin"){

branchBox.innerHTML=`
<select id="branchID">
<option value="ALL">All Branch</option>
</select>`;

let r=await apiGet({action:"getEmployeeList"});
let map={};

(r.data||[]).forEach(x=>map[x.branch_id]=1);

Object.keys(map).forEach(x=>{
branchID.innerHTML+=`
<option value="${x}">
${x}
</option>`;
});

}

leaveTypeBox.innerHTML=`
<select id="leaveType">
<option value="">All Leave Type</option>
</select>`;

let t=await apiGet({action:"getLeaveTypeList"});

(t.data||[]).forEach(x=>{
leaveType.innerHTML+=`
<option value="${x.type_name}">
${x.type_name}
</option>`;
});

statusBox.innerHTML=`
<select id="status">
<option value="">All Status</option>
<option>Pending</option>
<option>Approved</option>
<option>Rejected</option>
<option>Cancelled</option>
</select>`;

}

async function searchLeave(){

let p={
action:"getLeaveReportDashboard",
from:leave$("fromDate").value,
to:leave$("toDate").value,
leave_type:leave$("leaveType").value,
status:leave$("status").value
};

if(leaveUser.role=="Admin")
p.branch=leave$("branchID")?.value||"ALL";

if(leaveUser.role!="Employee")
p.employee=leave$("employeeID")?.value||"";

const r=await apiGet(p);

if(!r.success)return;

leaveRows=r.records||[];

renderLeaveKPI(r.summary||{});
renderLeave();

}

function renderLeaveKPI(s){

reportKPI.innerHTML=`

<div class="mini-card"><span>Total</span><b>${s.total||0}</b></div>

<div class="mini-card"><span>Pending</span><b>${s.pending||0}</b></div>

<div class="mini-card"><span>Approved</span><b>${s.approved||0}</b></div>

<div class="mini-card"><span>Rejected</span><b>${s.rejected||0}</b></div>

<div class="mini-card"><span>Cancelled</span><b>${s.cancelled||0}</b></div>

`;

}

function renderLeave(data=leaveRows){

leaveResult.innerHTML=`

<table class="attendance-table">

<thead>

<tr>

<th>Employee</th>
<th>Leave</th>
<th>Start</th>
<th>End</th>
<th>Days</th>
<th>Status</th>

</tr>

</thead>

<tbody>

${data.map(x=>`

<tr>

<td>${x.employee_name||"-"}</td>

<td>${x.leave_type||"-"}</td>

<td>${x.start_date||"-"}</td>

<td>${x.end_date||"-"}</td>

<td>${x.days||0}</td>

<td>
<span class="badge">
${x.status||"-"}
</span>
</td>

</tr>

`).join("")}

</tbody>

</table>

`;

}

async function exportLeave(type){

const action={
PDF:"exportReportPDF",
Excel:"exportReportExcel",
CSV:"exportReportCSV"
}[type];

let p={
action,
type:"leave",
from:leave$("fromDate").value,
to:leave$("toDate").value,
leave_type:leave$("leaveType").value,
status:leave$("status").value
};

if(leaveUser.role=="Admin")
p.branch=leave$("branchID")?.value||"ALL";

if(leaveUser.role!="Employee")
p.employee=leave$("employeeID")?.value||"";

const r=await apiGet(p);

if(!r.success){
alert(r.message||"Export Failed");
return;
}

showLeaveExport(r,type);

}

function showLeaveExport(r,type){

exportResult.innerHTML=`

<div class="export-card">

<h3>✅ ${type} Export Completed</h3>

<p>${r.fileName||"Report"}</p>

<button id="downloadBtn">
⬇️ Download File
</button>

<br><br>

<a
href="${r.viewUrl||r.openUrl}"
target="_blank">
👁️ View Drive File
</a>

</div>

`;

leave$("downloadBtn").onclick=()=>downloadLeave(r.fileId);

}

function downloadLeave(fileId){

window.open(

API_URL+
"?action=downloadExport"+
"&fileId="+encodeURIComponent(fileId)+
"&token="+encodeURIComponent(localStorage.token),

"downloadWindow",
"width=1,height=1"

);

}
