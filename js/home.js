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

const user=JSON.parse(localStorage.user||"{}");

greeting.innerHTML=
new Date().getHours()<12?
"☀ Good Morning":
new Date().getHours()<18?
"🌤 Good Afternoon":
"🌙 Good Evening";

employeeName.innerHTML=user.employee_name||"-";
branchName.innerHTML=user.branch_name||"-";

if(user.photo_url)
homeAvatar.src=user.photo_url;

try{

const r=await apiGet({
action:"getTodayAttendance"
});

const a=r.record||{};

checkIn.innerHTML=
a.checkIn||"--:--";

checkOut.innerHTML=
a.checkOut||"--:--";

/* Progress */
let p=0,
txt="Not Started",
icon="⏳";

if(r.exists){

p=50;
txt="Working";
icon="💼";

if(a.checkOut){

p=100;
txt="Completed";
icon="✅";

}

}

if(a.status=="Late")
icon="⚠";

statusText.innerHTML=txt;
statusEmoji.innerHTML=icon;

progressBar.style.width=p+"%";

/* Today */
todayType.innerHTML=a.dayType||"Working Day";

/* Leave */
leaveStatus.innerHTML=a.leaveStatus||"-";

cancelLeaveBtn.style.display=

a.leaveStatus=="Pending"
?"block":"none";

}catch(e){

statusText.innerHTML="Error";

}

}

cancelLeaveBtn.onclick=async()=>{

if(!confirm("Cancel this leave?"))
return;

const r=await apiPost({
action:"cancelLeave"
});

alert(r.message);

if(r.success)
loadHome();

};

window.addEventListener("focus",loadHome);
