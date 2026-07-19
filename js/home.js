window.homeClock=null;

const set=(id,v)=>{
const e=document.getElementById(id);
if(e)e.innerHTML=v;
};

function startClock(){

clearInterval(window.homeClock);

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

async function loadHome(){

startClock();

const btn=document.getElementById("cancelLeaveBtn");
const bar=document.getElementById("progressBar");

set("greeting",
new Date().getHours()<12?"☀️ Good Morning":
new Date().getHours()<18?"🌤️ Good Afternoon":
"🌙 Good Evening");

try{

const [p,a,c,l]=await Promise.all([
apiGet({action:"getProfile"}),
apiGet({action:"getTodayAttendance"}),
apiGet({
action:"getCalendarData",
month:new Date().toISOString().slice(0,7)
}),
apiGet({action:"getLeaveHistory"})
]);

const me=p.data||{};

set("employeeName",me.name||"-");
set("branchName",me.working_branch_name||"-");

const img=document.getElementById("homeAvatar");

if(img&&me.photo){
let url=me.photo;
if(url.includes("drive.google.com")){
const id=(url.match(/id=([^&]+)/)||[])[1];
if(id)url="https://lh3.googleusercontent.com/d/"+id;
}
img.src=url+"?t="+Date.now();
}

const t=a.record||{};
set("checkIn",t.checkIn||"--:--");
set("checkOut",t.checkOut||"--:--");

let pBar=0,txt="Not Started",icon="⏳";

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
if(bar)bar.style.width=pBar+"%";

const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kuala_Lumpur"}).format(new Date());
const weekday=new Intl.DateTimeFormat("en-US",{weekday:"long",timeZone:"Asia/Kuala_Lumpur"}).format(new Date());

const cal=c.data||{};

set("todayType",
(cal.leave||[]).some(x=>x.date==today)?"Leave":
(cal.holiday||[]).some(x=>x.date==today)?"Holiday":
(cal.weeklyOff||[]).includes(weekday)?"Weekly Off":
"Working Day");

const leave=(l.data||[]).find(x=>
["Pending","Approved","Rejected"].includes(x.status));

set("leaveStatus",leave?
`${leave.leave_type}<br>${leave.start_date} → ${leave.end_date}<br>${leave.days} Day(s)<br>${leave.status}`:"-");

if(btn){
btn.style.display=leave&&leave.status=="Pending"?"block":"none";
btn.dataset.id=leave?leave.leave_id:"";
btn.onclick=async()=>{
if(!btn.dataset.id)return;
if(!confirm("Cancel this leave?"))return;
const r=await apiPost({
action:"cancelLeave",
leave_id:btn.dataset.id
});
alert(r.message);
if(r.success)loadHome();
};
}

}catch(e){

console.error(e);
set("statusText","Error");

}

}

window.addEventListener("focus",()=>{
if(document.getElementById("homeAvatar"))loadHome();
});
