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
else
loadMyLeave();

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
// LEAVE
// ===============================
async function loadMyLeave(){

const res=
await apiGet({
action:"getLeaveHistory"
});

setSummary(
"Total Leave",
"Pending",
"Approved",
"Rejected",
0,0,0,0
);

reportResult.innerHTML=
(res.data||[]).map(r=>`

<div class="report-card">

<b>${r.leave_type}</b>

<p>
${r.start_date}
~
${r.end_date}
</p>

<p>
Days :
${r.days}
</p>

<span class="badge">
${r.status}
</span>

<p>
${r.reason||""}
</p>

</div>

`).join("")||"No Leave";

}

async function loadPendingLeave(){

const res=
await apiGet({
action:"getLeaveHistory"
});

let rows=
(res.data||[])
.filter(x=>x.status=="Pending");

renderLeave(rows);

}

async function loadLeaveBalance(){

const res=
await apiGet({
action:"getLeaveBalance"
});

renderLeave(
res.data||[],
true
);

}

function renderLeave(rows,balance=false){

reportResult.innerHTML=
rows.map(r=>`

<div class="report-card">

<b>
${r.leave_type}
</b>


<p>

${balance?

"Entitled : "+r.entitled+
"<br>Used : "+r.used+
"<br>Balance : "+r.balance

:

r.start_date+" ~ "+r.end_date+
"<br>Days : "+r.days+
"<br>Status : "+r.status

}

</p>


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
