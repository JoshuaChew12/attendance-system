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

if(me.photo)
homeAvatar.src=me.photo;

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

const today=new Date().toISOString().slice(0,10);
const cal=c.data||{};

todayType.innerHTML=
cal.leave?.find(x=>x.date==today)?"Leave":
cal.holiday?.find(x=>x.date==today)?"Holiday":
cal.weeklyOff?.find(x=>x.date==today)?"Weekly Off":
"Working Day";

const leave=(l.data||[])
.sort((a,b)=>new Date(b.created||0)-new Date(a.created||0))
.find(x=>["Pending","Approved","Rejected"].includes(x.status));

leaveStatus.innerHTML=
leave?leave.leave_type+" • "+leave.status:"-";

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

window.addEventListener("focus",loadHome);
