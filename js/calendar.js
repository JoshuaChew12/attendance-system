window.currentMonth=window.currentMonth||
new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Kuala_Lumpur"}).slice(0,7);

window.calendarData=[];

function formatMonth(m){
const p=m.split("-");
return p[0]+"-"+String(p[1]).padStart(2,"0");
}

async function loadCalendar(){
const user=JSON.parse(localStorage.getItem("user"));
if(!user) return;

const set=(id,v)=>{const el=document.getElementById(id);if(el)el.innerHTML=v};

set("monthTitle",formatMonth(currentMonth));

try{
const res=await apiGet({
action:"getMonthlyAttendance",
month:formatMonth(currentMonth),
employee_id:user.employee_id
});

if(res.success){
calendarData=res.data||[];
renderCalendar();
}
}catch(e){
set("calendarGrid","API Error");
}
}

function renderCalendar(){
const grid=document.getElementById("calendarGrid");
if(!grid) return;
grid.innerHTML="";

const [y,m]=currentMonth.split("-").map(Number);
const first=new Date(y,m-1,1).getDay();
const days=new Date(y,m,0).getDate();

for(let i=0;i<first;i++){
const d=document.createElement("div");
d.className="day empty";
grid.appendChild(d);
}

for(let i=1;i<=days;i++){
const date=`${currentMonth}-${String(i).padStart(2,"0")}`;
const r=calendarData.find(x=>x.date===date);

const d=document.createElement("div");
d.className="day";
d.innerHTML=i;

if(r){
if(r.status=="Present")d.classList.add("present-day");
else if(r.status=="Late")d.classList.add("late-day");
else if(r.status=="Absent")d.classList.add("absent-day");
}

d.onclick=()=>showDetail(date);
grid.appendChild(d);
}
}

async function showDetail(date){
const user=JSON.parse(localStorage.getItem("user"));

const res=await apiGet({
action:"getAttendanceByDate",
date:date,
employee_id:user.employee_id
});

const box=document.getElementById("detailBox");
if(!box) return;

if(res.success&&res.data){
const d=res.data;
box.innerHTML=`
<h3>${d.date}</h3>
<p><b>Day:</b>${d.day}</p>
<p><b>Check In:</b>${d.checkIn||"-"}</p>
<p><b>Check Out:</b>${d.checkOut||"-"}</p>
<p><b>Work Hours:</b>${d.workHours||0} hrs</p>
<p><b>Late:</b>${d.lateMinutes||0} min</p>
<p><b>Status:</b>${d.status||"-"}</p>
`;
}else box.innerHTML="No Attendance Record";
}

function prevMonth(){
const d=new Date(currentMonth+"-01");
d.setMonth(d.getMonth()-1);
currentMonth=d.toISOString().slice(0,7);
loadCalendar();
}

function nextMonth(){
const d=new Date(currentMonth+"-01");
d.setMonth(d.getMonth()+1);
currentMonth=d.toISOString().slice(0,7);
loadCalendar();
}
