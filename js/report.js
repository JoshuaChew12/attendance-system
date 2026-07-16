let reportType="attendance";
let reportRows=[];
let reportUser={};


/* =========================
 INIT
========================= */

async function loadReport(){

reportUser=
JSON.parse(localStorage.user||"{}");


initFilter();


switchReport("attendance");

}



/* =========================
 FILTER
========================= */


function initFilter(){

let role=reportUser.role;


let d=new Date();

toDate.value=
d.toISOString().slice(0,10);


d.setDate(1);

fromDate.value=
d.toISOString().slice(0,10);



// Employee Filter

if(role!="Employee"){

employeeBox.innerHTML=
`
<input 
id="employeeID"
placeholder="Employee ID">
`;

}
else{

employeeBox.innerHTML="";

}



// Branch Filter

if(role=="Admin"){

branchBox.innerHTML=
`
<select id="branchID">

<option value="ALL">
ALL BRANCH
</option>

</select>
`;

loadBranchOption();

}


else if(role=="Supervisor"){

branchBox.innerHTML=
`
<input 
value="${reportUser.branch_id}"
readonly>
`;

}

else{

branchBox.innerHTML="";

}


}





async function loadBranchOption(){

const r=
await apiGet({
action:"getBranches"
});


let html=
`
<option value="ALL">
ALL BRANCH
</option>
`;


(r.data||[]).forEach(b=>{

html+=
`
<option value="${b.branch_id}">
${b.name}
</option>
`;

});


branchID.innerHTML=html;

}





/* =========================
 SWITCH
========================= */


function switchReport(type){

reportType=type;


attendanceMode.style.display=
type=="attendance"
?"block"
:"none";


leaveMode.style.display=
type=="leave"
?"block"
:"none";


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





/* =========================
 ATTENDANCE DASHBOARD
========================= */


async function loadAttendanceDashboard(){


let params={

action:
"getAttendanceReportDashboard",

from:
fromDate.value,

to:
toDate.value

};



addFilter(params);



const r=
await apiGet(params);



let d=r.data||{};


presentCount.innerHTML=
d.present||0;


lateCount.innerHTML=
d.late||0;


leaveCount.innerHTML=
d.leave||0;


holidayCount.innerHTML=
d.holiday||0;


weeklyOffCount.innerHTML=
d.weeklyOff||0;


absentCount.innerHTML=
d.absent||0;



}



function addFilter(p){


if(
reportUser.role!="Employee"
&&
employeeID
){

p.employee=
employeeID.value||"";

}



if(branchID){

p.branch=
branchID.value;

}


}




/* =========================
 SEARCH ATTENDANCE
========================= */


async function searchReport(){


if(reportType=="attendance"){

await loadAttendance();


}

else{

await loadLeaveReport();

}


}




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
${r.employee_name}
</b>


<p>
${r.date}
</p>


<p>
${r.status}
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




/* =========================
 LEAVE MODULE
========================= */


function initLeaveModule(){


let html="";


if(reportUser.role=="Employee"){


html+=`

<button onclick="loadMyLeave()">
My Leave
</button>


<button onclick="loadLeaveBalance()">
Balance
</button>

`;

}



if(
reportUser.role=="Supervisor"
||
reportUser.role=="Admin"
){


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



if(reportUser.role=="Employee")
loadMyLeave();


}





async function loadMyLeave(){


const r=
await apiGet({

action:
"getLeaveHistory"

});


renderLeave(r.data||[]);


}





async function loadPendingLeave(){


const r=
await apiGet({

action:
"getLeaveReport",

from:
fromDate.value,

to:
toDate.value

});


let rows=
(r.records||[])
.filter(
x=>x.status=="Pending"
);



reportResult.innerHTML=

rows.map(x=>`

<div class="leave-card">


<b>
${x.employee_name}
</b>


<p>
${x.leave_type}
</p>


<p>
${x.start_date}
~
${x.end_date}
</p>


<button onclick="
approveLeave('${x.leave_id}')
">
Approve
</button>


<button onclick="
rejectLeave('${x.leave_id}')
">
Reject
</button>


</div>


`).join("")||"No Pending";

}





async function approveLeave(id){


let r=
await apiPost({

action:
"approveLeave",

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

action:
"rejectLeave",

leave_id:id,

reason

});


toast(r.message);


loadPendingLeave();

}





async function loadLeaveBalance(){


const r=
await apiGet({

action:
"getLeaveBalance"

});


renderLeave(r.data||[]);


}




async function loadLeaveReport(){


let p={

action:
"getLeaveReport",

from:
fromDate.value,

to:
toDate.value

};


addFilter(p);


const r=
await apiGet(p);


renderLeave(r.records||[]);


}




function renderLeave(rows){


reportResult.innerHTML=


rows.map(r=>`

<div class="leave-card">

<b>
${r.employee_name||""}
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
Days:
${r.days}
</p>


<p>
Status:
${r.status}
</p>


</div>


`).join("")||"No Record";


}



/* =========================
   ENTERPRISE EXPORT ENGINE
========================= */


function buildExportParams(){


let p={

from:
fromDate.value,

to:
toDate.value

};


if(reportUser.role!="Employee"){


if(employeeID){

p.employee=
employeeID.value||"";

}


}


if(branchID){

p.branch=
branchID.value;

}



return p;

}






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

a.href=
r.file;

a.download=
r.filename||
"Report";

a.click();

return;

}



toast(
r.message||
"Export Completed"
);


}






/* =========================
 Attendance Export
========================= */


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





/* =========================
 Leave Export
========================= */


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







/* =========================
 Button Router
========================= */


function exportPDF(){


if(reportType=="attendance")

exportAttendancePDF();

else

exportLeavePDF();


}




function exportExcel(){


if(reportType=="attendance")

exportAttendanceExcel();

else

exportLeaveExcel();


}




function exportCSV(){


if(reportType=="attendance")

exportAttendanceCSV();

else

exportLeaveCSV();


}
