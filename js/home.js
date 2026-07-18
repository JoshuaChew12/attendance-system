window.homeClock=null;

function startClock(){

clearInterval(homeClock);

const run=()=>{
const n=new Date();

liveClock.innerHTML=n.toLocaleTimeString("en-GB");

todayDate.innerHTML=
n.toLocaleDateString("en-GB",{
weekday:"long",
day:"2-digit",
month:"long",
year:"numeric"
});

};

run();
homeClock=setInterval(run,1000);

}

async function loadHome(){

startClock();

const h=new Date().getHours();

greeting.innerHTML=
h<12?"☀️ Good Morning":
h<18?"🌤️ Good Afternoon":
"🌙 Good Evening";

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

employeeName.innerHTML=me.name||"-";
branchName.innerHTML=me.working_branch_name||"-";

const img=document.getElementById("homeAvatar");

if(img && me.photo){
let p=me.photo;
if(p.includes("drive.google.com")){
const id=(p.match(/id=([^&]+)/)||[])[1];
if(id) p="https://lh3.googleusercontent.com/d/"+id;}
img.src=p+"?t="+Date.now();
}

const t=a.record||{};

checkIn.innerHTML=t.checkIn||"--:--";
checkOut.innerHTML=t.checkOut||"--:--";

let pBar=0,
txt="Not Started",
icon="⏳";

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

statusText.innerHTML=txt;
statusEmoji.innerHTML=icon;
progressBar.style.width=pBar+"%";

const today =new Intl.DateTimeFormat("en-CA",
{timeZone:"Asia/Kuala_Lumpur"}
).format(new Date());

const weekday =new Intl.DateTimeFormat("en-US",
{weekday:"long",timeZone:"Asia/Kuala_Lumpur"}
).format(new Date());

const cal=c.data||{};
const isLeave =(cal.leave||[]).some(x=>x.date==today);
const isHoliday =(cal.holiday||[]).some(x=>x.date==today);
const isWeeklyOff =(cal.weeklyOff||[]).includes(weekday);

todayType.innerHTML =
isLeave ? "Leave" :
isHoliday ? "Holiday" :
isWeeklyOff ? "Weekly Off" :
"Working Day";

const leave=(l.data||[])
.find(x=>["Pending","Approved","Rejected"].includes(x.status));

leaveStatus.innerHTML=leave?
`${leave.leave_type}<br>
${leave.start_date} → ${leave.end_date}<br>
${leave.days} Day(s)<br>
${leave.status}`:"-";

cancelLeaveBtn.style.display=
leave&&leave.status=="Pending"?"block":"none";

cancelLeaveBtn.dataset.id=
leave?leave.leave_id:"";

}catch(e){

statusText.innerHTML="Error";

}

}

cancelLeaveBtn.onclick=async()=>{

const id=cancelLeaveBtn.dataset.id;
if(!id) return;
if(!confirm("Cancel this leave?")) return;

const r=await apiPost({
action:"cancelLeave",
leave_id:id
});

alert(r.message);
if(r.success) loadHome();

};

window.addEventListener("focus",()=>{

if(location.hash==="home" || 
document.getElementById("homeAvatar"))
loadHome();

});
