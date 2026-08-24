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
   CACHE STRUCTURE

   {
     past:{
       "2026-08":{
         attendance:[],
         holiday:[],
         weeklyOff:[],
         leave:[]
       }
     },

     api:{
       "2026-08":{
         date:"2026-08-24",
         data:{
           attendance:[],
           holiday:[],
           weeklyOff:[],
           leave:[]
         }
       }
     }
   }

===================================== */


/* =====================================
   EMPTY DATA
===================================== */

function emptyCalendarData(){

return{
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

}


/* =====================================
   NORMALIZE DATA
===================================== */

function normalizeCalendarData(data){

data=data||{};

return{
attendance:Array.isArray(data.attendance)
?data.attendance
:[],

holiday:Array.isArray(data.holiday)
?data.holiday
:[],

weeklyOff:Array.isArray(data.weeklyOff)
?data.weeklyOff
:[],

leave:Array.isArray(data.leave)
?data.leave
:[]
};

}


/* =====================================
   GET PAST CACHE
===================================== */

function getPastCache(cache,month){

/*
   新格式
*/

if(
cache.past &&
cache.past[month]
){

return normalizeCalendarData(
cache.past[month]
);

}


/*
   兼容旧格式

   旧结构：

   cache["2026-08"]={
      attendance:[],
      holiday:[],
      weeklyOff:[],
      leave:[]
   }

*/

if(
cache[month] &&
typeof cache[month]==="object" &&
!Array.isArray(cache[month])
){

return normalizeCalendarData(
cache[month]
);

}

return emptyCalendarData();

}


/* =====================================
   SAVE PAST CACHE
===================================== */

function savePastCache(cache,month,data){

if(!cache.past)
cache.past={};

cache.past[month]=
normalizeCalendarData(data);

}


/* =====================================
   GET API SNAPSHOT
===================================== */

function getApiSnapshot(cache,month){

if(
!cache.api ||
!cache.api[month]
){

return null;

}

return cache.api[month];

}


/* =====================================
   SAVE API SNAPSHOT
===================================== */

function saveApiSnapshot(
cache,
month,
date,
data
){

if(!cache.api)
cache.api={};

cache.api[month]={
date:date,
data:normalizeCalendarData(data)
};

}


/* =====================================
   BUILD PAST DATA

   Only dates before TODAY
   are permanently cached.

===================================== */

function buildPastData(data){

const today=getToday();

const result=emptyCalendarData();

[
"attendance",
"holiday",
"weeklyOff",
"leave"
]
.forEach(key=>{

result[key]=
(data[key]||[])
.filter(x=>{

return x &&
x.date &&
x.date<today;

});

});

return result;

}


/* =====================================
   MERGE PAST CACHE + API

   Past:
      CACHE wins

   Today/Future:
      API wins

===================================== */

function mergeCalendarData(
pastData,
apiData
){

const today=getToday();

const result=emptyCalendarData();

[
"attendance",
"holiday",
"weeklyOff",
"leave"
]
.forEach(key=>{

const map={};


/* =====================================
   1. PAST CACHE
===================================== */

(pastData[key]||[])
.filter(x=>{

return x &&
x.date &&
x.date<today;

})
.forEach(x=>{

map[x.date]=x;

});


/* =====================================
   2. API
=====================================

   API can contain:

   Past
   Today
   Future

   But only Today/Future are allowed
   to overwrite the permanent cache.

*/

(apiData[key]||[])
.filter(x=>{

return x &&
x.date &&
x.date>=today;

})
.forEach(x=>{

map[x.date]=x;

});


/* =====================================
   3. RESULT
===================================== */

result[key]=Object.values(map)
.sort((a,b)=>{

return String(a.date)
.localeCompare(String(b.date));

});

});

return result;

}


/* =====================================
   MOVE API PAST → PERMANENT CACHE

   Example:

   Today = 25 Aug

   Yesterday = 24 Aug

   Previous API snapshot:

   24
   25
   26
   27
   ...

   24 is now permanently moved into Past Cache.

===================================== */

function updatePastCacheFromApi(
cache,
month,
apiData
){

const today=getToday();

const past=
getPastCache(
cache,
month
);

const result=normalizeCalendarData(past);

[
"attendance",
"holiday",
"weeklyOff",
"leave"
]
.forEach(key=>{

const map={};


/* =====================================
   EXISTING PAST CACHE
===================================== */

(result[key]||[])
.filter(x=>{

return x &&
x.date &&
x.date<today;

})
.forEach(x=>{

map[x.date]=x;

});


/* =====================================
   PREVIOUS API DATA

   Anything that is now Past
   becomes permanent cache.

   Existing cache wins.

===================================== */

(apiData[key]||[])
.filter(x=>{

return x &&
x.date &&
x.date<today;

})
.forEach(x=>{

if(!map[x.date])
map[x.date]=x;

});


result[key]=Object.values(map)
.sort((a,b)=>{

return String(a.date)
.localeCompare(String(b.date));

});

});


savePastCache(
cache,
month,
result
);

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


/* =====================================
   MONTH TITLE
===================================== */

const monthTitleEl=
document.getElementById("monthTitle");

if(monthTitleEl)
monthTitleEl.textContent=
formatMonthTitle(currentMonth);


/* =====================================
   TODAY
===================================== */

const today=
getToday();

const todayMonth=
today.slice(0,7);


/* =====================================
   CACHE
===================================== */

const cache=
getCalendarCache();


/* =====================================
   PAST CACHE
===================================== */

let pastData=
getPastCache(
cache,
currentMonth
);


/* =====================================
   API SNAPSHOT
===================================== */

const apiSnapshot=
getApiSnapshot(
cache,
currentMonth
);


/* =====================================
   IF API SNAPSHOT EXISTS
===================================== */

if(apiSnapshot){

/*
   如果之前 API 是昨天：

   例如：

   API date = 23
   TODAY   = 24

   23 已经变成 Past

   所以先把它永久保存。

*/

if(apiSnapshot.data){

pastData=
updatePastCacheFromApi(
cache,
currentMonth,
apiSnapshot.data
);

saveCalendarCache(cache);

}


/* =====================================
   API SNAPSHOT IS TODAY
===================================== */

if(
apiSnapshot.date===today
){

/*
   今天已经 API 过。

   不再 API。

   直接：

   Past Cache
   +
   Today/Future API Snapshot
*/

calendarData=
mergeCalendarData(
pastData,
apiSnapshot.data
);

renderCalendar();

return;

}

}


/* =====================================
   PAST MONTH
===================================== */

if(
currentMonth<todayMonth
){

/*
   整个月都是 Past。

   如果已经有 cache：

      直接使用。

   不 API。

*/

if(
pastData.attendance.length ||
pastData.holiday.length ||
pastData.weeklyOff.length ||
pastData.leave.length
){

calendarData=
pastData;

renderCalendar();

return;

}


/*
   没有 cache。

   第一次进入旧月份，
   需要 API 一次取得历史资料。

*/

try{

const r=await apiGet({

action:"getCalendarData",

month:currentMonth,

employee_id:user.employee_id

});

if(!r.success)
return;

const apiData=
normalizeCalendarData(
r.data
);


/*
   整个月都是 Past，
   所以全部永久 Cache。

*/

savePastCache(
cache,
currentMonth,
apiData
);

saveCalendarCache(cache);

calendarData=
apiData;

renderCalendar();

return;

}catch(e){

console.error(
"Calendar Load Error:",
e
);

return;

}

}


/* =====================================
   CURRENT / FUTURE MONTH
=====================================

   Current Month:
      Today/Future → API

   Future Month:
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
normalizeCalendarData(
r.data
);


/* =====================================
   SAVE PAST FIRST
=====================================

   如果 API 本身已经包含 Past：

   Past 不丢失。

*/

pastData=
updatePastCacheFromApi(
cache,
currentMonth,
apiData
);


/* =====================================
   SAVE TODAY API SNAPSHOT
===================================== */

if(
currentMonth===todayMonth
){

/*
   当前月份：

   记录今天已经 API。

   今天再次进入：
   不再 API。

*/

saveApiSnapshot(
cache,
currentMonth,
today,
apiData
);

}else{

/*
   Future Month：

   仍然保存 API snapshot。

   当前日期作为 snapshot date，
   防止同一天重复 API。

*/

saveApiSnapshot(
cache,
currentMonth,
today,
apiData
);

}


/* =====================================
   SAVE CACHE
===================================== */

saveCalendarCache(cache);


/* =====================================
   MERGE
===================================== */

calendarData=
mergeCalendarData(
pastData,
apiData
);


/* =====================================
   RENDER
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

const todayMonth=
getCurrentMonth();

if(
currentMonth!==todayMonth
){

currentMonth=
todayMonth;

}

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


const today=
getToday();


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

function renderAttendanceDetail(
date,
s
){

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

function renderLeaveDetail(
date,
l
){

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

function renderHolidayDetail(
date,
h
){

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

function renderWeeklyOffDetail(
date,
w
){

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
"en-CA",
{
timeZone:"Asia/Kuala_Lumpur"
}
)
.slice(0,7);


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
"en-CA",
{
timeZone:"Asia/Kuala_Lumpur"
}
)
.slice(0,7);


window.selectedLeaveDate="";


loadCalendar();

}
