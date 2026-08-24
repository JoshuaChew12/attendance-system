window.currentMonth=getCurrentMonth();

window.calendarData={
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

const CALENDAR_CACHE_KEY="calendar_cache";

/* =====================================
   MONTH
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
   CACHE DATA
   TODAY NEVER ENTERS CACHE
===================================== */

function buildCacheData(data){

const today=getToday();

const result={
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

["attendance","holiday","weeklyOff","leave"]
.forEach(key=>{

result[key]=(data[key]||[])
.filter(x=>x.date<today);

});

return result;

}

/* =====================================
   MERGE
===================================== */

function mergeCalendarData(oldData,newData){

const today=getToday();

const result={
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

["attendance","holiday","weeklyOff","leave"]
.forEach(key=>{

const map={};

/* =====================================
   1. OLD CACHE
   Past → CACHE
===================================== */

(oldData[key]||[])
.filter(x=>x.date<today)
.forEach(x=>{
map[x.date]=x;
});


/* =====================================
   2. API DATA
   Past + Today + Future
===================================== */

(newData[key]||[])
.forEach(x=>{

/*
   API 的 Past 也先放进来
   这样第一次加载时：
   23号以前不会消失
*/

map[x.date]=x;

});


result[key]=Object.values(map);

});

return result;

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


/* =====================================
   1. CACHE FIRST
   ONLY PAST DATA
===================================== */

const cache=
getCalendarCache();

const cached=
cache[currentMonth];

if(cached){

calendarData={
attendance:(cached.attendance||[])
.filter(x=>x.date<getToday()),

holiday:(cached.holiday||[])
.filter(x=>x.date<getToday()),

weeklyOff:(cached.weeklyOff||[])
.filter(x=>x.date<getToday()),

leave:(cached.leave||[])
.filter(x=>x.date<getToday())
};

renderCalendar();

}else{

calendarData={
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

}


/* =====================================
   2. API
   TODAY + FUTURE
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
   3. MERGE
   Past  = Cache
   Today = API
   Future= API
===================================== */

calendarData=
mergeCalendarData(
calendarData,
apiData
);


/* =====================================
   4. SAVE ONLY PAST
===================================== */

cache[currentMonth]=
buildCacheData(
calendarData
);

saveCalendarCache(cache);


/* =====================================
   5. FINAL RENDER
===================================== */

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
