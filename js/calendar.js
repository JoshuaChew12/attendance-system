window.currentMonth=window.currentMonth||new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Kuala_Lumpur"}).slice(0,7);

window.calendarData={attendance:[],holiday:[],weeklyOff:[],leave:[]};

function loadCalendar(){

const user=JSON.parse(localStorage.getItem("user"));
if(!user)return;

monthTitle.innerHTML=currentMonth;

apiGet({
action:"getCalendarData",
month:currentMonth,
employee_id:user.employee_id
})
.then(r=>{
if(r.success){
calendarData=r.data||calendarData;
renderCalendar();
}
});

}


function getDayStatus(date){

let x=calendarData.attendance.find(a=>a.date==date);
if(x)return{
type:x.type,
label:x.type=="Late"?"L":"P",
cls:x.type=="Late"?"late-day":"present-day",
data:x
};

x=calendarData.holiday.find(a=>a.date==date);
if(x)return{
type:"Holiday",
label:"H",
cls:"holiday-day",
data:x
};

x=calendarData.weeklyOff.find(a=>a.date==date);
if(x)return{
type:"Weekly Off",
label:"OFF",
cls:"weekly-day",
data:x
};

x=calendarData.leave.find(a=>a.date==date);
if(x)return{
type:x.type,
label:"LV",
cls:"leave-day",
data:x
};

return{type:"",label:"",cls:"",data:null};

}


function renderCalendar(){

calendarGrid.innerHTML="";

const [y,m]=currentMonth.split("-").map(Number);
const start=new Date(y,m-1,1).getDay();
const total=new Date(y,m,0).getDate();
const today=new Date().toLocaleDateString("en-CA",{timeZone:"Asia/Kuala_Lumpur"});


for(let i=0;i<start;i++)
calendarGrid.innerHTML+="<div class='day empty'></div>";


for(let i=1;i<=total;i++){

let date=currentMonth+"-"+String(i).padStart(2,"0");
let s=getDayStatus(date);

let d=document.createElement("div");

d.className="day "+s.cls+(date==today?" today":"");

d.innerHTML=`
<div>${i}<small>${s.label}</small></div>
`;

d.onclick=()=>showDetail(date);

calendarGrid.appendChild(d);

}

}


function showDetail(date){

window.selectedLeaveDate=date;
let box=document.getElementById("detailBox");
let s=getDayStatus(date);

if(!s.data){
box.innerHTML=`
<h3>${date}</h3>
<p>No Attendance</p>
<button
class="leave-btn"
onclick="openLeaveApply()">
📝 Apply Leave
</button>`;
return;
}


if(s.type=="Holiday"||s.type=="Weekly Off"){

box.innerHTML=`
<h3>${date}</h3>
<p>Status : ${s.type}</p>
${s.data.name||""}
`;

return;

}


let a=s.data;

box.innerHTML=`
<h3>${date}</h3>
<p>Status : ${a.type}</p>
<p>Check In : ${a.checkIn||"-"}</p>
<p>Check Out : ${a.checkOut||"-"}</p>
<p>Hours : ${a.workHours||0}</p>
<p>Late : ${a.late||0} min</p>
`;

}

function openLeaveApply(){

if(!window.selectedLeaveDate){
alert("Please select a date.");
return;
}

loadPage("leaveApply");

}

function prevMonth(){

let d=new Date(currentMonth+"-01");
d.setMonth(d.getMonth()-1);
currentMonth=d.toISOString().slice(0,7);
loadCalendar();

}


function nextMonth(){

let d=new Date(currentMonth+"-01");
d.setMonth(d.getMonth()+1);
currentMonth=d.toISOString().slice(0,7);
loadCalendar();

}
