window.homeClock=null;
window.homeLoading=false;

const HOME_CACHE_KEY="home_cache";

function set(id,v){
const e=document.getElementById(id);
if(e)e.innerHTML=v;
}

/* =====================================
   CACHE
===================================== */

function getHomeCache(){

try{
return JSON.parse(localStorage.getItem(HOME_CACHE_KEY)||"{}");
}catch(e){
return {};
}

}

function saveHomeCache(data){

try{
localStorage.setItem(HOME_CACHE_KEY,JSON.stringify(data));
}catch(e){}

}

/* =====================================
   CLOCK
===================================== */

function startClock(){

clearInterval(window.homeClock);
window.homeClock=null;

const run=()=>{

const n=new Date();

set(
"liveClock",
n.toLocaleTimeString("en-GB")
);

set(
"todayDate",
n.toLocaleDateString("en-GB",{
weekday:"long",
day:"2-digit",
month:"long",
year:"numeric"
})
);

};

run();

window.homeClock=setInterval(run,1000);

}

/* =====================================
   PROFILE
===================================== */

function renderHomeProfile(me){

set(
"employeeName",
me.name||"-"
);

set(
"branchName",
me.working_branch_name||"-"
);

const img=document.getElementById("homeAvatar");

if(img&&me.photo){

let url=me.photo;

if(url.includes("drive.google.com")){

const id=(url.match(/id=([^&]+)/)||[])[1];

if(id)
url="https://lh3.googleusercontent.com/d/"+id;

}

img.src=url+"?t="+Date.now();

}

}

/* =====================================
   ATTENDANCE
   NEVER CACHE
===================================== */

function renderHomeAttendance(a){

const t=a.record||{};

set(
"checkIn",
t.checkIn||"--:--"
);

set(
"checkOut",
t.checkOut||"--:--"
);

let pBar=0;
let txt="Not Started";
let icon="⏳";

if(a.exists){

pBar=50;
txt="Working";

icon=
t.status=="Late"
?"⚠️"
:"💼";

if(t.checkOut){

pBar=100;
txt="Completed";
icon="✅";

}

}

set("statusText",txt);
set("statusEmoji",icon);

const bar=document.getElementById("progressBar");

if(bar)
bar.style.width=pBar+"%";

}

/* =====================================
   TODAY TYPE
===================================== */

function renderTodayType(c){

const today=
new Intl.DateTimeFormat(
"en-CA",
{
timeZone:"Asia/Kuala_Lumpur"
}
).format(new Date());

const cal=c||{};

set(
"todayType",

(cal.leave||[]).some(
x=>x.date==today
)
?"Leave":

(cal.holiday||[]).some(
x=>x.date==today
)
?"Holiday":

(cal.weeklyOff||[]).some(
x=>x.date==today
)
?"Weekly Off":

"Working Day"
);

}

/* =====================================
   LEAVE
   NEVER CACHE
===================================== */

function renderHomeLeave(l){

const btn=
document.getElementById("cancelLeaveBtn");

const leave=
(l.data||[]).find(
x=>[
"Pending",
"Approved",
"Rejected"
].includes(x.status)
);

set(
"leaveStatus",

leave
?`${leave.leave_type}<br>
${leave.start_date} → ${leave.end_date}<br>
${leave.days} Day(s)<br>
${leave.status}`
:"-"
);

if(!btn)return;

btn.style.display=
leave&&leave.status=="Pending"
?"block"
:"none";

btn.dataset.id=
leave?leave.leave_id:"";

btn.onclick=async()=>{

if(!btn.dataset.id)return;

if(!confirm("Cancel this leave?"))
return;

btn.disabled=true;

try{

const r=await apiPost({
action:"cancelLeave",
leave_id:btn.dataset.id
});

alert(r.message);

if(r.success)
loadHome();

}catch(e){

console.error(e);

}finally{

btn.disabled=false;

}

};

}

/* =====================================
   MAIN
===================================== */

async function loadHome(){

if(window.homeLoading)
return;

window.homeLoading=true;

startClock();

const h=new Date().getHours();

set(
"greeting",
h<12
?"☀️ Good Morning"
:h<18
?"🌤️ Good Afternoon"
:"🌙 Good Evening"
);

/* =====================================
   CACHE FIRST
===================================== */

const cache=getHomeCache();

if(cache.profile)
renderHomeProfile(cache.profile);

/* =====================================
   API
   REAL-TIME DATA ALWAYS REFRESH
===================================== */

try{

const user=
JSON.parse(
localStorage.getItem("user")||"{}"
);

const month=
new Date()
.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Kuala_Lumpur"
}
)
.slice(0,7);

const requests=[
apiGet({
action:"getTodayAttendance"
}),

apiGet({
action:"getCalendarData",
month:month,
employee_id:user.employee_id
}),

apiGet({
action:"getMyLeave"
})
];

/*
Profile:
只有没有 cache 才需要立即请求。
但为了确保 Profile 修改后不会长期旧，
有 cache 时也后台刷新。
*/

requests.unshift(
apiGet({
action:"getProfile"
})
);

const [
p,
a,
c,
l
]=await Promise.all(requests);

/* =====================================
   PROFILE
===================================== */

const me=p.data||{};

renderHomeProfile(me);

saveHomeCache({
profile:me,
updated:Date.now()
});

/* =====================================
   REAL-TIME
===================================== */

renderHomeAttendance(a);

renderTodayType(c.data||{});

renderHomeLeave(l);

}catch(e){

console.error("Home Load Error:",e);

set("statusText","Error");

}finally{

window.homeLoading=false;

}

}

/* =====================================
   PAGE FOCUS
===================================== */

window.addEventListener("focus",()=>{

if(
document.getElementById("homeAvatar") &&
!window.homeLoading
){

loadHome();

}

});
