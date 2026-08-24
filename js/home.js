window.homeClock=null;
window.homeLoading=false;
window.homeLoaded=false;

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

function getTodayMY(){

return new Intl.DateTimeFormat("en-CA",{
timeZone:"Asia/Kuala_Lumpur"
}).format(new Date());

}

async function loadHome(force=false){

if(window.homeLoading)return;
if(window.homeLoaded&&!force)return;

window.homeLoading=true;

startClock();

const btn=document.getElementById("cancelLeaveBtn");
const bar=document.getElementById("progressBar");

const h=new Date().getHours();

set("greeting",
h<12?"☀️ Good Morning":
h<18?"🌤️ Good Afternoon":
"🌙 Good Evening");

try{

/* =====================================
   STEP 1
   最重要资料先加载
===================================== */
const [p,a]=await Promise.all([

apiGet({action:"getProfile"}),
apiGet({action:"getTodayAttendance"})

]);

/* PROFILE */
const me=p.data||{};

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

/* ATTENDANCE */
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
   STEP 2
   其他资料后台加载
===================================== */
loadHomeExtra(btn);
window.homeLoaded=true;

}catch(e){

console.error(e);
set("statusText","Error");

}finally{

window.homeLoading=false;

}

}

/* =====================================
   EXTRA DATA
   不再阻塞 Home 首屏
===================================== */
async function loadHomeExtra(btn){

try{

const user=JSON.parse(
localStorage.getItem("user")||"{}"
);

const today=getTodayMY();
const [c,l]=await Promise.all([

apiGet({
action:"getCalendarData",
month:today.slice(0,7),
employee_id:user.employee_id
}),

apiGet({
action:"getMyLeave"
})

]);

/* =====================================
   TODAY TYPE
===================================== */
const cal=c.data||{
attendance:[],
holiday:[],
weeklyOff:[],
leave:[]
};

const type=

(cal.leave||[]).some(x=>x.date==today)?"Leave":
(cal.holiday||[]).some(x=>x.date==today)?"Holiday":
(cal.weeklyOff||[]).some(x=>x.date==today)?"Weekly Off":

"Working Day";
set("todayType",type);

/* =====================================
   LEAVE
===================================== */
const leave=(l.data||[]).find(x=>
["Pending","Approved","Rejected"].includes(x.status)
);

set(
"leaveStatus",
leave?
`${leave.leave_type}<br>${leave.start_date} → ${leave.end_date}<br>${leave.days} Day(s)<br>${leave.status}`
:"-"
);

/* =====================================
   CANCEL LEAVE
===================================== */
if(btn){

btn.style.display=
leave&&leave.status=="Pending"
?"block"
:"none";

btn.dataset.id=
leave?leave.leave_id:"";

btn.onclick=async()=>{

if(!btn.dataset.id)return;
if(!confirm("Cancel this leave?"))return;

const r=await apiPost({
action:"cancelLeave",
leave_id:btn.dataset.id
});

alert(r.message);

if(r.success){

window.homeLoaded=false;
loadHome(true);

}

};

}

}catch(e){

console.error("Home extra:",e);

}

}

/* =====================================
   FOCUS
===================================== */
window.onfocus=()=>{

if(
document.getElementById("homeAvatar")&&
!window.homeLoading&&
!window.homeLoaded
){

loadHome();

}

};
