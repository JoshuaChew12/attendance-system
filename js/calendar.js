window.currentMonth =window.currentMonth || getCurrentMonth();
window.calendarData={attendance:[],holiday:[],weeklyOff:[],leave:[]};

function getCurrentMonth(){
return new Date()
.toLocaleDateString("en-CA",{timeZone:"Asia/Kuala_Lumpur"}).slice(0,7);
}

function loadCalendar(){

const user=JSON.parse(localStorage.getItem("user")||"{}");
if(!user.employee_id)return;

monthTitle.textContent=currentMonth;

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

function gotoToday(){

const today=getCurrentMonth();
if(currentMonth!==today)
currentMonth=today;
window.selectedLeaveDate="";
loadCalendar();

}

function getDayStatus(date){

let x=calendarData.leave.find(a=>a.date==date);
if(x)return{
type:"Leave",
label:"LV",
cls:"leave-day",
data:x
};

x=calendarData.attendance.find(a=>a.date==date);
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
d.innerHTML=`<div>${i}<small>${s.label}</small></div>`;
d.onclick=()=>showDetail(date);

calendarGrid.appendChild(d);

}

}

function showDetail(date){

window.selectedLeaveDate = date;
const box = document.getElementById("detailBox");
const status = getDayStatus(date);

switch(status.type){

case "Leave":box.innerHTML = renderLeaveDetail(date,status.data);
break;
case "Holiday":box.innerHTML = renderHolidayDetail(date,status.data);
break;
case "Weekly Off":box.innerHTML = renderWeeklyOffDetail(date,status.data);
break;
case "Present":
case "Late":box.innerHTML = renderAttendanceDetail(date,status);
break;
default:box.innerHTML = renderEmptyDetail(date);

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

let date=window.selectedLeaveDate||"";
sessionStorage.setItem("leaveStartDate",date);

loadPage("leaveApply");

}

function prevMonth(){

const d=new Date(currentMonth+"-01");
d.setMonth(d.getMonth()-1);
currentMonth=d.toISOString().slice(0,7);
window.selectedLeaveDate="";
loadCalendar();

}


function nextMonth(){

const d=new Date(currentMonth+"-01");
d.setMonth(d.getMonth()+1);
currentMonth=d.toISOString().slice(0,7);
window.selectedLeaveDate="";
loadCalendar();

}
