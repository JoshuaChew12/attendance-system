window.homeClock=null;
window.homeLoading=false;

const HOME_CACHE="home_cache";
const HOME_CACHE_TTL=30*60*1000;

function set(id,v){
const e=document.getElementById(id);
if(e)e.innerHTML=v;
}

function startClock(){

clearInterval(window.homeClock);
window.homeClock=null;

const run=()=>{
const n=new Date();

set("liveClock",n.toLocaleTimeString("en-GB"));

set("todayDate",n.toLocaleDateString("en-GB",{
weekday:"long",
day:"2-digit",
month:"long",
year:"numeric"
}));

};

run();
window.homeClock=setInterval(run,1000);

}

function getHomeCache(){

try{

const x=JSON.parse(localStorage.getItem(HOME_CACHE)||"null");

if(!x||!x.time||Date.now()-x.time>HOME_CACHE_TTL)
return null;

return x.data||null;

}catch(e){

return null;

}

}

function saveHomeCache(data){

try{

localStorage.setItem(
HOME_CACHE,
JSON.stringify({
time:Date.now(),
data:data
})
);

}catch(e){}

}

function renderHomeProfile(me){

me=me||{};

set("employeeName",me.name||"-");
set("branchName",me.working_branch_name||"-");

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

async function loadHome(){

if(window.homeLoading)return;

window.homeLoading=true;

startClock();

const btn=document.getElementById("cancelLeaveBtn");
const bar=document.getElementById("progressBar");

const h=new Date().getHours();

set(
"greeting",
h<12?"☀️ Good Morning":
h<18?"🌤️ Good Afternoon":
"🌙 Good Evening"
);

try{

/* =====================================
   PROFILE
===================================== */
let me=getHomeCache();

const profilePromise=me
?Promise.resolve({data:me})
:apiGet({action:"getProfile"});

/* =====================================
   REAL-TIME DATA
===================================== */
const [p,a,c,l]=await Promise.all([

profilePromise,

apiGet({
action:"getTodayAttendance"
}),

apiGet({
action:"getCalendarData",
month:getCurrentMonth(),
employee_id:JSON.parse(
localStorage.getItem("user")||"{}"
).employee_id
}),

apiGet({
action:"getMyLeave"
})

]);

/* PROFILE */

if(!me){

me=p.data||{};

saveHomeCache(me);

}

renderHomeProfile(me);

/* =====================================
   TODAY ATTENDANCE
   NEVER CACHE
===================================== */
const t=a.record||{};

set("checkIn",t.checkIn||"--:--");
set("checkOut",t.checkOut||"--:--");

let pBar=0;
let txt="Not Started";
let icon="⏳";

if(a.exists){

pBar=50;
txt="Working";
icon=t.status=="Late"?"⚠️":"💼";

if(t.checkOut){

pBar=100;
txt="Completed";
icon="✅";

}

}

set("statusText",txt);
set("statusEmoji",icon);

if(bar)
bar.style.width=pBar+"%";

/* =====================================
   TODAY TYPE
===================================== */
const today=new Intl.DateTimeFormat(
"en-CA",
{
timeZone:"Asia/Kuala_Lumpur"
}
).format(new Date());

const cal=c.data||{};

set(
"todayType",

(cal.leave||[]).some(x=>x.date==today)
?"Leave":

(cal.holiday||[]).some(x=>x.date==today)
?"Holiday":

(cal.weeklyOff||[]).some(x=>x.date==today)
?"Weekly Off":

"Working Day"
);

/* =====================================
   LEAVE
   NEVER CACHE
===================================== */
const leave=(l.data||[]).find(x=>
["Pending","Approved","Rejected"].includes(x.status)
);

set(
"leaveStatus",

leave?

`${leave.leave_type}<br>
${leave.start_date} → ${leave.end_date}<br>
${leave.days} Day(s)<br>
${leave.status}`

:"-"
);

if(btn){

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

const r=await apiPost({
action:"cancelLeave",
leave_id:btn.dataset.id
});

alert(r.message);

if(r.success){

/*
 * 不更新 cache
 * 因为 leave 根本没有进入 home_cache
 */
loadHome();

}

};

}

}catch(e){

console.error(e);

set("statusText","Error");

}

finally{

window.homeLoading=false;

}

}

window.onfocus=()=>{

if(
document.getElementById("homeAvatar") &&
!window.homeLoading
)
loadHome();

};
