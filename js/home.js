async function loadHome(){
const user=JSON.parse(localStorage.getItem("user"));
if(!user) return;

const set=(id,val)=>{const el=document.getElementById(id);if(el)el.innerHTML=val};

set("employeeName",user.employee_name||user.employee_id);
set("branchName",user.branch_name||user.branch_id);

try{
const dash=await apiGet({action:"getDashboard",branch:user.branch_id});
if(dash.success){set("present",dash.data.present);set("late",dash.data.late);}
}catch(e){console.log(e);}

try{
const today=await apiGet({action:"getTodayAttendance"});
const r=today.record||{};
set("checkIn",r.checkIn||"--:--");
set("checkOut",r.checkOut||"--:--");
set("statusText",!today.exists?"Not Started":(r.checkOut?"Completed":"Working"));
}catch(e){
set("statusText","Error");
}

}

window.addEventListener("focus",loadHome);
