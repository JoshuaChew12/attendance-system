// =====================================================
// CALENDAR V2
// MOBILE APP STYLE
// =====================================================
let currentMonth =
new Date()
.toISOString()
.slice(0,7);

let calendarData=[];

// =====================================================
// FORMAT MONTH
// =====================================================
function formatMonth(m){

const p=m.split("-");

return p[0]+"-"+
String(p[1]).padStart(2,"0");

}

// =====================================================
// LOAD CALENDAR
// =====================================================
async function loadCalendar(){

const user =
JSON.parse(
localStorage.getItem("user")
);

if(!user)
return;

document.getElementById(
"monthTitle"
).innerHTML =
formatMonth(currentMonth);

try{

const res =
await apiGet({
action:
"getMonthlyAttendance",
employee_id:
user.employee_id,
month:
formatMonth(currentMonth)

});

if(res.success){

calendarData =
res.data || [];

renderCalendar();

}

}catch(err){

console.log(
"Calendar Error",
err
);

document.getElementById(
"calendarGrid"
).innerHTML=

"API Error";

}

}

// =====================================================
// RENDER CALENDAR
// =====================================================
function renderCalendar(){

const grid =
document.getElementById(
"calendarGrid"
);

grid.innerHTML="";

const year =
Number(
currentMonth.split("-")[0]
);

const month =
Number(
currentMonth.split("-")[1]
);

// first day

const firstDay =
new Date(
year,
month-1,
1
)
.getDay();

// days

const totalDays =
new Date(
year,
month,
0
)
.getDate();

// empty before day 1

for(
let i=0;
i<firstDay;
i++
){

const empty=
document.createElement("div");

empty.className="day empty";

grid.appendChild(empty);

}

// dates

for(
let i=1;
i<=totalDays;
i++
){

const date =

`${currentMonth}-${String(i).padStart(2,"0")}`;

const record =

calendarData.find(

d=>d.date===date

);

const div =
document.createElement("div");

div.className="day";

div.innerHTML=i;

if(record){

if(record.status=="Present"){

div.classList.add(
"present-day"
);

}

else if(record.status=="Late"){

div.classList.add(
"late-day"
);

}

else if(record.status=="Absent"){

div.classList.add(
"absent-day"
);

}

}

div.onclick=()=>{

showDetail(date);

};

grid.appendChild(div);

}
  
}

// =====================================================
// DETAIL
// =====================================================
async function showDetail(date){

const user =
JSON.parse(
localStorage.getItem("user")
);

const res =
await apiGet({

action:
"getAttendanceByDate",
employee_id:
user.employee_id,
date:date

});

const box =
document.getElementById(
"detailBox"
);

if(
res.success &&
res.data
){

const d=res.data;

box.innerHTML=`

<h3>
${d.date}
</h3>

<p>
<b>Day:</b>
${d.day}
</p>

<p>
<b>Check In:</b>
${d.checkIn || "-"}
</p>

<p>
<b>Check Out:</b>
${d.checkOut || "-"}
</p>

<p>
<b>Work Hours:</b>
${d.workHours || 0}
hrs
</p>

<p>
<b>Late:</b>
${d.lateMinutes || 0}
min
</p>

<p>
<b>Status:</b>
${d.status || "-"}
</p>

`;

}

else{
box.innerHTML=
"No Attendance Record";
}

}

// =====================================================
// MONTH CONTROL
// =====================================================
function prevMonth(){

let d =
new Date(
currentMonth+"-01"
);

d.setMonth(
d.getMonth()-1
);

currentMonth =

d.toISOString()
.slice(0,7);

loadCalendar();

}

function nextMonth(){

let d =
new Date(
currentMonth+"-01"
);

d.setMonth(
d.getMonth()+1
);

currentMonth =

d.toISOString()
.slice(0,7);

loadCalendar();

}

// IMPORTANT
// Because app.js dynamically loads pages

loadCalendar();
