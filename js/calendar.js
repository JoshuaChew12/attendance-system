let currentMonth = new Date().toISOString().slice(0,7);
let calendarData = [];

// ===============================
// INIT PAGE
// ===============================
function initCalendarPage(){

currentMonth = new Date().toISOString().slice(0,7);
calendarData = [];

loadCalendar();

}

// ===============================
// LOAD CALENDAR
// ===============================
async function loadCalendar(){

const user = JSON.parse(localStorage.getItem("user"));
if(!user) return;

const title = document.getElementById("monthTitle");
if(title){
title.innerHTML = currentMonth;
}

try{

const res = await apiGet({
action:"getMonthlyAttendance",
employee_id:user.employee_id,
month:currentMonth
});

if(res.success){
calendarData = res.data || [];
renderCalendar();
}

}catch(err){
console.log("Calendar Error",err);
document.getElementById("calendarGrid").innerHTML="Error";
}

}

// ===============================
function renderCalendar(){

const grid = document.getElementById("calendarGrid");
if(!grid) return;

grid.innerHTML="";

const year = Number(currentMonth.split("-")[0]);
const month = Number(currentMonth.split("-")[1]);

const firstDay = new Date(year,month-1,1).getDay();
const totalDays = new Date(year,month,0).getDate();

for(let i=0;i<firstDay;i++){
const empty=document.createElement("div");
empty.className="day empty";
grid.appendChild(empty);
}

for(let i=1;i<=totalDays;i++){

const date =
`${currentMonth}-${String(i).padStart(2,"0")}`;

const record = calendarData.find(d=>d.date===date);

const div=document.createElement("div");
div.className="day";
div.innerHTML=i;

if(record){
if(record.status==="Present") div.classList.add("present-day");
if(record.status==="Late") div.classList.add("late-day");
if(record.status==="Absent") div.classList.add("absent-day");
}

div.onclick=()=>showDetail(date);

grid.appendChild(div);
}

}

// ===============================
async function showDetail(date){

const user = JSON.parse(localStorage.getItem("user"));

const res = await apiGet({
action:"getAttendanceByDate",
employee_id:user.employee_id,
date:date
});

const box = document.getElementById("detailBox");

if(res.success && res.data){
const d=res.data;

box.innerHTML=`
<h3>${d.date}</h3>
<p><b>Check In:</b> ${d.checkIn||"-"}</p>
<p><b>Check Out:</b> ${d.checkOut||"-"}</p>
<p><b>Status:</b> ${d.status||"-"}</p>
`;
}else{
box.innerHTML="No Record";
}

}

// ===============================
function prevMonth(){
let d=new Date(currentMonth+"-01");
d.setMonth(d.getMonth()-1);
currentMonth=d.toISOString().slice(0,7);
loadCalendar();
}

function nextMonth(){
let d=new Date(currentMonth+"-01");
d.setMonth(d.getMonth()+1);
currentMonth=d.toISOString().slice(0,7);
loadCalendar();
}
