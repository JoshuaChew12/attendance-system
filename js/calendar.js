window.currentMonth=getCurrentMonth();

window.calendarData={
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

const CALENDAR_CACHE_KEY="calendar_cache";

/* =====================================
   DATE
===================================== */

function getCurrentMonth(){

return new Date()
.toLocaleDateString(
"en-CA",
{timeZone:"Asia/Kuala_Lumpur"}
)
.slice(0,7);

}

function getToday(){

return new Date()
.toLocaleDateString(
"en-CA",
{timeZone:"Asia/Kuala_Lumpur"}
);

}

/* =====================================
   CACHE
===================================== */

function getCalendarCache(){

try{

return JSON.parse(
localStorage.getItem(
CALENDAR_CACHE_KEY
)||"{}"
);

}catch(e){

return {};

}

}

function saveCalendarCache(cache){

try{

localStorage.setItem(
CALENDAR_CACHE_KEY,
JSON.stringify(cache)
);

}catch(e){

console.warn(
"Calendar cache save failed",
e
);

}

}

/* =====================================
   FORMAT MONTH
===================================== */

function formatMonthTitle(month){

const [y,m]=month.split("-");

const date=
new Date(
y,
Number(m)-1,
1
);

return date.toLocaleDateString(
"en-US",
{
month:"long",
year:"numeric"
}
);

}

/* =====================================
   LOAD CALENDAR

   PAST
   → CACHE

   TODAY / FUTURE
   → API

   CURRENT MONTH
   → API ONCE
   → API PAST → SAVE CACHE
===================================== */

async function loadCalendar(){

const user=
JSON.parse(
localStorage.getItem("user")||"{}"
);

if(!user.employee_id)
return;

const monthTitleEl=
document.getElementById("monthTitle");

if(monthTitleEl){

monthTitleEl.textContent=
formatMonthTitle(currentMonth);

}

const today=getToday();
const todayMonth=getCurrentMonth();

const cache=getCalendarCache();

const cachedMonth=
cache[currentMonth]||{};

const result={
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

/* =====================================
   PAST MONTH
   CACHE ONLY
===================================== */

if(currentMonth<todayMonth){

["attendance","holiday","weeklyOff","leave"]
.forEach(key=>{

(cachedMonth[key]||[])
.forEach(x=>{

if(x.date<today){

result[key].push(x);

}

});

});

window.calendarData=result;

renderCalendar();

return;

}

/* =====================================
   CURRENT / FUTURE MONTH
   API
===================================== */

try{

const r=await apiGet({

action:"getCalendarData",

month:currentMonth,

employee_id:user.employee_id

});

if(!r.success)
return;

const apiData=
r.data||{
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

/* =====================================
   PAST
   ONLY SAVE API PAST INTO CACHE

   TODAY / FUTURE NEVER CACHE
===================================== */

if(currentMonth===todayMonth){

const newCache={
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

["attendance","holiday","weeklyOff","leave"]
.forEach(key=>{

newCache[key]=
(apiData[key]||[])
.filter(x=>x.date<today);

});

/* 保存当前月份 Past */

cache[currentMonth]=newCache;

saveCalendarCache(cache);

}

/* =====================================
   DISPLAY

   PAST
   → CACHE

   TODAY / FUTURE
   → API
===================================== */

["attendance","holiday","weeklyOff","leave"]
.forEach(key=>{

/* Past → Cache */

(cachedMonth[key]||[])
.forEach(x=>{

if(x.date<today){

result[key].push(x);

}

});

/* Today + Future → API */

(apiData[key]||[])
.forEach(x=>{

if(x.date>=today){

result[key].push(x);

}

});

});

/* =====================================
   FINAL DATA
===================================== */

window.calendarData=result;

renderCalendar();

}catch(e){

console.error(
"Calendar Load Error:",
e
);

}

}

/* =====================================
   GOTO TODAY
===================================== */

function gotoToday(){

const today=getCurrentMonth();

if(currentMonth!==today)
currentMonth=today;

window.selectedLeaveDate="";

loadCalendar();

}

/* =====================================
   DAY STATUS
===================================== */

function getDayStatus(date){

let x=
calendarData.leave.find(
a=>a.date==date
);

if(x)
return{
type:"Leave",
label:"LV",
cls:"leave-day",
data:x
};

x=
calendarData.attendance.find(
a=>a.date==date
);

if(x)
return{
type:x.type,
label:x.type=="Late"?"L":"P",
cls:
x.type=="Late"
?"late-day"
:"present-day",
data:x
};

x=
calendarData.holiday.find(
a=>a.date==date
);

if(x)
return{
type:"Holiday",
label:"H",
cls:"holiday-day",
data:x
};

x=
calendarData.weeklyOff.find(
a=>a.date==date
);

if(x)
return{
type:"Weekly Off",
label:"OFF",
cls:"weekly-day",
data:x
};

return{
type:"",
label:"",
cls:"",
data:null
};

}

/* =====================================
   RENDER
===================================== */

function renderCalendar(){

const grid=
document.getElementById(
"calendarGrid"
);

if(!grid)
return;

grid.innerHTML="";

const [y,m]=
currentMonth
.split("-")
.map(Number);

const start=
new Date(
y,
m-1,
1
).getDay();

const total=
new Date(
y,
m,
0
).getDate();

const today=getToday();

for(let i=0;i<start;i++){

grid.innerHTML+=
"<div class='day empty'></div>";

}

for(let i=1;i<=total;i++){

const date=
currentMonth+
"-"+
String(i).padStart(2,"0");

const s=
getDayStatus(date);

const d=
document.createElement("div");

d.className=
"day "+
s.cls+
(date==today?" today":"");

d.innerHTML=
`<div>${i}<small>${s.label}</small></div>`;

d.onclick=()=>{
showDetail(date);
};

grid.appendChild(d);

}

}

/* =====================================
   DETAIL
===================================== */

function showDetail(date){

window.selectedLeaveDate=date;

const box=
document.getElementById(
"detailBox"
);

const status=
getDayStatus(date);

if(!box)
return;

switch(status.type){

case "Leave":

box.innerHTML=
renderLeaveDetail(
date,
status.data
);

break;

case "Holiday":

box.innerHTML=
renderHolidayDetail(
date,
status.data
);

break;

case "Weekly Off":

box.innerHTML=
renderWeeklyOffDetail(
date,
status.data
);

break;

case "Present":
case "Late":

box.innerHTML=
renderAttendanceDetail(
date,
status
);

break;

default:

box.innerHTML=
renderEmptyDetail(date);

}

}

/* =====================================
   ATTENDANCE DETAIL
===================================== */

function renderAttendanceDetail(date,s){

const a=s.data;

return `
<h3>${date}</h3>
<p><b>Status :</b> ${s.type}</p>
<hr>
<p>Check In : ${a.checkIn||"-"}</p>
<p>Check Out : ${a.checkOut||"-"}</p>
<p>Work Hours : ${a.workHours||0}</p>
<p>Late : ${a.late||0} min</p>
<p>Early Leave : ${a.early||0} min</p>
`;

}

/* =====================================
   LEAVE DETAIL
===================================== */

function renderLeaveDetail(date,l){

return `
<h3>${date}</h3>
<p><b>Status :</b> Leave</p>
<hr>
<p>Leave Type : ${l.leaveType||"-"}</p>
<p>Days : ${l.days||0}</p>
<p>Half Day : ${l.halfDay||"Full Day"}</p>
<p>Reason : ${l.reason||"-"}</p>
<div class="leave-info">
✅ Leave already applied for this date.
</div>
`;

}

/* =====================================
   HOLIDAY
===================================== */

function renderHolidayDetail(date,h){

return `
<h3>${date}</h3>
<p><b>Holiday</b></p>
<hr>
<p>${h.name||"-"}</p>
`;

}

/* =====================================
   WEEKLY OFF
===================================== */

function renderWeeklyOffDetail(date,w){

return `
<h3>${date}</h3>
<p><b>Weekly Off</b></p>
<hr>
<p>${w.name||"Rest Day"}</p>
`;

}

/* =====================================
   EMPTY
===================================== */

function renderEmptyDetail(date){

return `
<h3>${date}</h3>
<p>No Attendance Record</p>

<button
class="leave-btn"
onclick="openLeaveApply()">
📝 Apply Leave
</button>
`;

}

/* =====================================
   APPLY LEAVE
===================================== */

function openLeaveApply(){

const date=
window.selectedLeaveDate||"";

sessionStorage.setItem(
"leaveStartDate",
date
);

loadPage("leaveApply");

}

/* =====================================
   PREVIOUS MONTH
===================================== */

function prevMonth(){

const d=
new Date(
currentMonth+"-01"
);

d.setMonth(
d.getMonth()-1
);

currentMonth=
d.toLocaleDateString(
"en-CA"
)
.slice(0,7);

window.selectedLeaveDate="";

loadCalendar();

}

/* =====================================
   NEXT MONTH
===================================== */

function nextMonth(){

const d=
new Date(
currentMonth+"-01"
);

d.setMonth(
d.getMonth()+1
);

currentMonth=
d.toLocaleDateString(
"en-CA"
)
.slice(0,7);

window.selectedLeaveDate="";

loadCalendar();

}
