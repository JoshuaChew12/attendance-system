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
{
timeZone:"Asia/Kuala_Lumpur"
}
)
.slice(0,7);

}

function getToday(){

return new Date()
.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Kuala_Lumpur"
}
);

}

/* =====================================
   CACHE
   DATE BASED
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

}catch(e){}

}

/* =====================================
   GET ONE DATE DATA
===================================== */

function getDateData(data,date){

return{

attendance:(data.attendance||[])
.filter(x=>x.date==date),

holiday:(data.holiday||[])
.filter(x=>x.date==date),

weeklyOff:(data.weeklyOff||[])
.filter(x=>x.date==date),

leave:(data.leave||[])
.filter(x=>x.date==date)

};

}

/* =====================================
   CACHE PAST DATA
   ONLY PAST DATE
===================================== */

function updateCalendarCache(
cache,
data,
month,
today
){

const [y,m]=
month.split("-").map(Number);

const total=
new Date(y,m,0).getDate();

for(let i=1;i<=total;i++){

const date=
month+
"-"+
String(i).padStart(2,"0");

/*
   ONLY PAST
*/

if(date<today){

cache[date]=
getDateData(
data,
date
);

}

}

}

/* =====================================
   BUILD DISPLAY
===================================== */

function buildCurrentMonthData(
cache,
apiData,
month,
today
){

const result={
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

const [y,m]=
month.split("-").map(Number);

const total=
new Date(y,m,0).getDate();

for(let i=1;i<=total;i++){

const date=
month+
"-"+
String(i).padStart(2,"0");

/* =====================================
   PAST
   → CACHE ONLY
===================================== */

if(date<today){

const x=cache[date];

if(!x)continue;

result.attendance.push(
...(x.attendance||[])
);

result.holiday.push(
...(x.holiday||[])
);

result.weeklyOff.push(
...(x.weeklyOff||[])
);

result.leave.push(
...(x.leave||[])
);

continue;

}

/* =====================================
   TODAY / FUTURE
   → API ONLY
===================================== */

result.attendance.push(
...(apiData.attendance||[])
.filter(x=>x.date==date)
);

result.holiday.push(
...(apiData.holiday||[])
.filter(x=>x.date==date)
);

result.weeklyOff.push(
...(apiData.weeklyOff||[])
.filter(x=>x.date==date)
);

result.leave.push(
...(apiData.leave||[])
.filter(x=>x.date==date)
);

}

return result;

}

/* =====================================
   BUILD PAST MONTH FROM CACHE
===================================== */

function buildPastMonthData(
cache,
month
){

const result={
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

const [y,m]=
month.split("-").map(Number);

const total=
new Date(y,m,0).getDate();

for(let i=1;i<=total;i++){

const date=
month+
"-"+
String(i).padStart(2,"0");

const x=cache[date];

if(!x)continue;

result.attendance.push(
...(x.attendance||[])
);

result.holiday.push(
...(x.holiday||[])
);

result.weeklyOff.push(
...(x.weeklyOff||[])
);

result.leave.push(
...(x.leave||[])
);

}

return result;

}

/* =====================================
   CHECK MONTH CACHE
===================================== */

function isPastMonthCached(
cache,
month
){

const [y,m]=
month.split("-").map(Number);

const total=
new Date(y,m,0).getDate();

for(let i=1;i<=total;i++){

const date=
month+
"-"+
String(i).padStart(2,"0");

if(!cache[date])
return false;

}

return true;

}

/* =====================================
   MONTH TITLE
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

if(monthTitleEl)
monthTitleEl.textContent=
formatMonthTitle(currentMonth);

const today=getToday();
const todayMonth=getCurrentMonth();

const cache=getCalendarCache();

/* =====================================
   PAST MONTH
   CACHE ONLY
===================================== */

if(currentMonth<todayMonth){

/*
   Cache complete
   → NO API
*/

if(isPastMonthCached(
cache,
currentMonth
)){

calendarData=
buildPastMonthData(
cache,
currentMonth
);

renderCalendar();

return;

}

/*
   Cache incomplete
   → API ONCE
*/

try{

const r=await apiGet({

action:"getCalendarData",

month:currentMonth,

employee_id:user.employee_id

});

if(!r.success)
return;

const data=
r.data||{
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

/*
   建立整个过去月份 Cache
*/

updateCalendarCache(
cache,
data,
currentMonth,
today
);

saveCalendarCache(cache);

/*
   Display from Cache
*/

calendarData=
buildPastMonthData(
cache,
currentMonth
);

renderCalendar();

}catch(e){

console.error(
"Calendar Past Load Error:",
e
);

}

return;

}

/* =====================================
   CURRENT / FUTURE
   API
===================================== */

try{

/*
   当前月份 / Future Month
   API 只调用一次
*/

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
   CURRENT MONTH
===================================== */

if(currentMonth===todayMonth){

/*
   API Past
   → 建立 Cache

   但显示时
   Past 绝对不用 API
*/

updateCalendarCache(
cache,
apiData,
currentMonth,
today
);

saveCalendarCache(cache);

/*
   Past
   → Cache

   Today/Future
   → API
*/

calendarData=
buildCurrentMonthData(
cache,
apiData,
currentMonth,
today
);

}else{

/* =====================================
   FUTURE MONTH
   API ONLY
===================================== */

calendarData={

attendance:
apiData.attendance||[],

holiday:
apiData.holiday||[],

weeklyOff:
apiData.weeklyOff||[],

leave:
apiData.leave||[]

};

}

renderCalendar();

}catch(e){

console.error(
"Calendar Load Error:",
e
);

}

}

/* =====================================
   TODAY
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
   PREVIOUS
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
).slice(0,7);

window.selectedLeaveDate="";

loadCalendar();

}

/* =====================================
   NEXT
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
).slice(0,7);

window.selectedLeaveDate="";

loadCalendar();

}
