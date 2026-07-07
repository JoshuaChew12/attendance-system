window.reportRows=[];

async function loadReport(){

const token=localStorage.getItem("token");
const user=JSON.parse(localStorage.getItem("user"));

if(user.role!="Employee"){

document.getElementById("employeeBox").innerHTML=
'<input id="employeeID" placeholder="Employee ID (Optional)">';

}

const today=new Date().toISOString().split("T")[0];
document.getElementById("toDate").value=today;
const d=new Date();
d.setDate(1);

document.getElementById("fromDate").value=
d.toISOString().split("T")[0];

await searchReport();

}

async function searchReport(){

const data=await apiGet({

action:"getReport",

from:
document.getElementById("fromDate").value,

to:
document.getElementById("toDate").value,

employee:
document.getElementById("employeeID")?
document.getElementById("employeeID").value:""

});

reportRows=data.records||[];

renderReport();

}

function updateSummary(){

let present=0;
let late=0;
let hours=0;

reportRows.forEach(r=>{

if(r.status=="Present") present++;

if(r.status=="Late"){
present++;
late++;
}

hours+=Number(r.workHours)||0;

});

document.getElementById("sumPresent").innerHTML=present;
document.getElementById("sumLate").innerHTML=late;
document.getElementById("sumHours").innerHTML=hours.toFixed(2);

document.getElementById("sumAverage").innerHTML=

present
?(hours/present).toFixed(2)
:"0";

}

function renderReport(){

updateSummary();

const box=document.getElementById("reportResult");

if(reportRows.length==0){

box.innerHTML="<p>No Record</p>";

return;

}

box.innerHTML=reportRows.map(r=>`

<div class="report-card">
<b>${r.date}</b>
<p>${r.status}</p>
<p>${r.checkIn} → ${r.checkOut}</p>
<p>${r.workHours} hrs</p>

</div>

`).join("");

}
