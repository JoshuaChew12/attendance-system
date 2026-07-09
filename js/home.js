window.homeClock=null;

function startClock(){

clearInterval(window.homeClock);

const update=()=>{

const now=new Date();

const t=now.toLocaleTimeString("en-GB");

const d=now.toLocaleDateString("en-GB",{

weekday:"long",
day:"2-digit",
month:"long",
year:"numeric"

});

const c=document.getElementById("liveClock");
const x=document.getElementById("todayDate");

if(c)c.innerHTML=t;
if(x)x.innerHTML=d;

};

update();

window.homeClock=setInterval(update,1000);

}

async function loadHome(){

startClock();

const user=JSON.parse(localStorage.getItem("user"));
if(!user)return;

const set=(i,v)=>{
const e=document.getElementById(i);
if(e)e.innerHTML=v;
};

const h=new Date().getHours();

set("greeting",
h<12?"☀ Good Morning":
h<18?"🌤 Good Afternoon":
"🌙 Good Evening");

set("employeeName",user.employee_name);
set("branchName",user.branch_name);

// Supervisor / Admin 才读取 Dashboard
if(user.role!="Employee"){

try{

const dash=await apiGet({
action:"getDashboard",
branch:user.branch_id
});

if(dash.success){

set("present",dash.data.present);
set("late",dash.data.late);

}

}catch(e){}

}else{

set("present","-");
set("late","-");

}

try{

const t=await apiGet({
action:"getTodayAttendance"
});

const r=t.record||{};

set("checkIn",r.checkIn||"--:--");
set("checkOut",r.checkOut||"--:--");

let text="Not Started";
let icon="⏳";
let p=0;

if(t.exists){

text="Working";
icon="💼";
p=50;

if(r.checkOut){

text="Completed";
icon="✅";
p=100;

}

}

if(r.status=="Late")
icon="⚠";

set("statusText",text);
set("statusEmoji",icon);

const bar=document.getElementById("progressBar");
if(bar)
bar.style.width=p+"%";

}catch(e){

set("statusText","Error");

}

}

window.addEventListener("focus",loadHome);
