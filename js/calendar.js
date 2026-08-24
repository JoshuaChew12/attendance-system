window.currentMonth=getCurrentMonth();
window.calendarData={
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

const CALENDAR_CACHE="calendar_cache";
const CALENDAR_CACHE_TTL=6*60*60*1000;

/* =====================================
   CURRENT MONTH
===================================== */

function getCurrentMonth(){

return new Date()
.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Kuala_Lumpur"
}
).slice(0,7);

}

/* =====================================
   CACHE
===================================== */

function getCalendarCache(){

try{

const x=JSON.parse(
localStorage.getItem(CALENDAR_CACHE)||"null"
);

if(!x||!x.data)
return {};

return x.data;

}catch(e){

return {};

}

}

function saveCalendarCache(data){

try{

localStorage.setItem(
CALENDAR_CACHE,
JSON.stringify({
time:Date.now(),
data:data
})
);

}catch(e){}

}

/* =====================================
   MONTH TITLE
===================================== */

function formatMonthTitle(month){

const [y,m]=month.split("-");

const date=new Date(
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

const user=JSON.parse(
localStorage.getItem("user")||"{}"
);

if(!user.employee_id)return;

monthTitle.textContent=
formatMonthTitle(currentMonth);

const today=getCurrentMonth();
const cache=getCalendarCache();
const cached=cache[currentMonth];

/* =====================================
   PAST MONTH
===================================== */

if(currentMonth!==today){

if(cached){

calendarData=cached;
renderCalendar();
return;

}

try{

const r=await apiGet({

action:"getCalendarData",
month:currentMonth,
employee_id:user.employee_id

});

if(!r.success)return;

calendarData=r.data||{
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

cache[currentMonth]=calendarData;
saveCalendarCache(cache);

renderCalendar();

}catch(e){

console.error(e);

}

return;

}

/* =====================================
   CURRENT MONTH
===================================== */

/*
 * 先显示 cache
 */
if(cached){

calendarData=cached;
renderCalendar();

}

/*
 * 再获取最新数据
 *
 * 目前 Backend 只有整个月 API，
 * 所以这里仍然调用 getCalendarData。
 *
 * 但只在当前月份调用。
 */

try{

const r=await apiGet({

action:"getCalendarData",
month:today,
employee_id:user.employee_id

});

if(!r.success)return;

const fresh=r.data||{
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

/*
 * 过去日期进入 cache
 * Today 不进入 cache
 */

const clean=removeTodayData(fresh);

cache[today]=clean;

saveCalendarCache(cache);

/*
 * 页面使用：
 * cache + Today realtime
 */

calendarData=mergeTodayData(
clean,
fresh,
today
);

renderCalendar();

}catch(e){

console.error(e);

}

}

/* =====================================
   REMOVE TODAY
===================================== */

function removeTodayData(data){

const today=getTodayDate();

return {

attendance:(data.attendance||[])
.filter(x=>x.date!==today),

holiday:(data.holiday||[])
.filter(x=>x.date!==today),

weeklyOff:(data.weeklyOff||[])
.filter(x=>x.date!==today),

leave:(data.leave||[])
.filter(x=>x.date!==today)

};

}

/* =====================================
   TODAY DATA
===================================== */

function getTodayDate(){

return new Date()
.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Kuala_Lumpur"
}
);

}

/* =====================================
   MERGE TODAY
===================================== */

function mergeTodayData(
cached,
fresh,
today
){

return {

attendance:[
...(cached.attendance||[]),
...(fresh.attendance||[])
.filter(x=>x.date===today)
],

holiday:[
...(cached.holiday||[]),
...(fresh.holiday||[])
.filter(x=>x.date===today)
],

weeklyOff:[
...(cached.weeklyOff||[]),
...(fresh.weeklyOff||[])
.filter(x=>x.date===today)
],

leave:[
...(cached.leave||[]),
...(fresh.leave||[])
.filter(x=>x.date===today)
]

};

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

let x=calendarData.leave.find(
a=>a.date==date
);

if(x)
return{
type:"Leave",
label:"LV",
cls:"leave-day",
data:x
};

x=calendarData.attendance.find(
a=>a.date==date
);

if(x)
return{
type:x.type,
label:x.type=="Late"?"L":"P",
cls:x.type=="Late"
?"late-day"
:"present-day",
data:x
};

x=calendarData.holiday.find(
a=>a.date==date
);

if(x)
return{
type:"Holiday",
label:"H",
cls:"holiday-day",
data:x
};

x=calendarData.weeklyOff.find(
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

calendarGrid.innerHTML="";

const [y,m]=currentMonth
.split("-")
.map(Number);

const start=
new Date(y,m-1,1).getDay();

const total=
new Date(y,m,0).getDate();

const today=getTodayDate();

for(let i=0;i<start;i++)

calendarGrid.innerHTML+=
"<div class='day empty'></div>";

for(let i=1;i<=total;i++){

let date=
currentMonth+"-"+
String(i).padStart(2,"0");

let s=getDayStatus(date);

let d=document.createElement("div");

d.className=
"day "+s.cls+
(date==today?" today":"");

d.innerHTML=
`<div>${i}<small>${s.label}</small></div>`;

d.onclick=()=>showDetail(date);

calendarGrid.appendChild(d);

}

}

/* =====================================
   DETAIL
===================================== */

function showDetail(date){

window.selectedLeaveDate=date;

const box=
document.getElementById("detailBox");

const status=
getDayStatus(date);

switch(status.type){

case "Leave":
box.innerHTML=
renderLeaveDetail(date,status.data);
break;

case "Holiday":
box.innerHTML=
renderHolidayDetail(date,status.data);
break;

case "Weekly Off":
box.innerHTML=
renderWeeklyOffDetail(date,status.data);
break;

case "Present":
case "Late":
box.innerHTML=
renderAttendanceDetail(date,status);
break;

default:
box.innerHTML=
renderEmptyDetail(date);

}

}

function renderAttendanceDetail(date,s){

const a=s.data;

return `
<h3>${date}</h3>
<p><b>Status :</b> ${s.type}</p>
<hr>
<p>Check In :${a.checkIn||"-"}</p>
<p>Check Out :${a.checkOut||"-"}</p>
<p>Work Hours :${a.workHours||0}</p>
<p>Late :${a.late||0} min</p>
<p>Early Leave :${a.early||0} min</p>
`;

}

function renderLeaveDetail(date,l){

return `
<h3>${date}</h3>
<p><b>Status :</b> Leave</p>
<hr>
<p>Leave Type :${l.leaveType||"-"}</p>
<p>Days :${l.days||0}</p>
<p>Half Day :${l.halfDay||"Full Day"}</p>
<p>Reason :${l.reason||"-"}</p>
<div class="leave-info">
✅ Leave already applied for this date.
</div>
`;

}

function renderHolidayDetail(date,h){

return `
<h3>${date}</h3>
<p><b>Holiday</b></p>
<hr>
<p>${h.name||"-"}</p>
`;

}

function renderWeeklyOffDetail(date,w){

return `
<h3>${date}</h3>
<p><b>Weekly Off</b></p>
<hr>
<p>${w.name||"Rest Day"}</p>
`;

}

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

function openLeaveApply(){

let date=
window.selectedLeaveDate||"";

sessionStorage.setItem(
"leaveStartDate",
date
);

loadPage("leaveApply");

}

/* =====================================
   MONTH NAVIGATION
===================================== */

function prevMonth(){

const d=
new Date(currentMonth+"-01");

d.setMonth(d.getMonth()-1);

currentMonth=
d.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Kuala_Lumpur"
}
).slice(0,7);

window.selectedLeaveDate="";

loadCalendar();

}

function nextMonth(){

const d=
new Date(currentMonth+"-01");

d.setMonth(d.getMonth()+1);

currentMonth=
d.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Kuala_Lumpur"
}
).slice(0,7);

window.selectedLeaveDate="";

loadCalendar();

}
