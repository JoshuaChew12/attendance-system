window.reportRows=[];

async function loadReport(){

const user=JSON.parse(localStorage.getItem("user"));

if(user.role!="Employee")
document.getElementById("employeeBox").innerHTML=
'<input id="employeeID" placeholder="Employee ID">';

const t=new Date();
document.getElementById("toDate").value=t.toISOString().split("T")[0];
t.setDate(1);
document.getElementById("fromDate").value=t.toISOString().split("T")[0];

await searchReport();

}

async function searchReport(){

const res=await apiGet({

action:"getReport",

from:fromDate.value,

to:toDate.value,

employee:employeeID?employeeID.value:""

});

reportRows=(res.records||[])

.sort((a,b)=>b.date.localeCompare(a.date));

updateSummary();

renderReport();

}

function updateSummary(){

let p=0,l=0,h=0;

reportRows.forEach(r=>{

if(r.status=="Present")p++;

if(r.status=="Late"){p++;l++;}

h+=Number(r.workHours)||0;

});

sumPresent.innerHTML=p;
sumLate.innerHTML=l;
sumHours.innerHTML=h.toFixed(2);
sumAverage.innerHTML=p?(h/p).toFixed(2):0;

}

function renderReport(){

if(!reportRows.length){

reportResult.innerHTML="<p>No Record</p>";

return;

}

reportResult.innerHTML=reportRows.map((r,i)=>`

<div class="report-card">

<div class="report-head"
onclick="toggleReport(${i})">

<b>${r.date}</b>

<span class="badge ${r.status.toLowerCase()}">
${r.status}
</span>

</div>

<div id="detail${i}" style="display:none">
<p><b>Check In</b> : ${r.checkIn}</p>
<p><b>Check Out</b> : ${r.checkOut}</p>
<p><b>Work Hours</b> : ${r.workHours}</p>
<p><b>Late</b> : ${r.lateMinutes} mins</p>
<p><b>Early Leave</b> : ${r.earlyLeave} mins</p>

</div>

</div>

`).join("");

}

function toggleReport(i){

const d=document.getElementById("detail"+i);

d.style.display=

d.style.display=="none"
?"block"
:"none";

}

function exportCSV(){

if(!reportRows.length) return;

let csv=
"Date,Status,CheckIn,CheckOut,Hours,Late,Early Leave\n";

reportRows.forEach(r=>{

csv+=

`${r.date},${r.status},${r.checkIn},${r.checkOut},${r.workHours},${r.lateMinutes},${r.earlyLeave}\n`;

});

const blob=new Blob([csv],{type:"text/csv"});

const a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="AttendanceReport.csv";

a.click();

}
