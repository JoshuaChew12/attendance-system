let leaveBalanceData=[];
let submitting=false;

document.addEventListener("DOMContentLoaded",()=>{

loadLeaveType();
loadLeaveSummary();

["startDate","endDate"].forEach(id=>
document.getElementById(id)
.addEventListener("change",calculateDays)
);

document
.querySelectorAll('input[name="halfDay"]')
.forEach(x=>x.addEventListener("change",calculateDays));

document
.getElementById("leaveFile")
.addEventListener("change",previewFile);

});

async function loadLeaveType(){

const s=document.getElementById("leaveType");
s.innerHTML='<option value="">Select Leave Type</option>';

try{
const r=await apiGet({action:"getLeaveTypeList"});
if(!r.success)return;

r.data.forEach(x=>{
const o=document.createElement("option");
o.value=x.id;
o.textContent=x.name;
s.appendChild(o);
});

}catch(e){console.log(e);}

}

async function loadLeaveSummary(){

const emp=JSON.parse(sessionStorage.getItem("user")||"{}");
if(!emp.employee_id)return;

try{

const r=await apiGet({
action:"getLeaveSummary",
employee_id:emp.employee_id,
year:new Date().getFullYear()
});

if(!r.success)return;

leaveBalanceData=r.data||[];
renderBalance();

}catch(e){console.log(e);}

}

function renderBalance(){

const box=document.getElementById("leaveBalance");

if(!leaveBalanceData.length){box.innerHTML="";
return;
}

box.innerHTML=leaveBalanceData.map(x=>`

<div class="balance-card">
<b>${x.leave_type}</b><br>
Entitled : ${x.entitled}<br>
Used : ${x.used}<br>
Pending : ${x.pending}<br>
Balance : <strong>${x.balance}</strong>
</div>

`).join("");

}

function calculateDays(){

const s=startDate.value;
const e=endDate.value;

if(!s||!e){leaveDuration.innerHTML="0 Day";
return 0;}

if(s>e){leaveDuration.innerHTML="Invalid Date";
return 0;}

let d=new Date(s),l=new Date(e),days=0;
while(d<=l){days++;
d.setDate(d.getDate()+1);
}

if(document.querySelector('input[name="halfDay"]:checked').value)
days-=0.5;

leaveDuration.innerHTML=days+(days>1?" Days":" Day");

return days;

}

function previewFile(){

const f=leaveFile.files[0];
if(!f){filePreview.innerHTML="";
return;
}

if(f.size>5*1024*1024){
toast("File too large (Max 5MB)");
leaveFile.value="";
filePreview.innerHTML="";
return;
}

filePreview.innerHTML="✔️ "+f.name;

}

async function uploadAttachment(){

const f=leaveFile.files[0];
if(!f)return "";
return new Promise((resolve,reject)=>{

const r=new FileReader();
r.onload=async()=>{

try{

const x=await apiPost({
action:"uploadLeaveAttachment",
file:r.result,
filename:f.name
});

x.success?resolve(x.url||""):reject(x.message);
}catch(e){reject(e);}

};

r.readAsDataURL(f);

});

}

async function submitLeave(){

if(submitting)return;

const type=leaveType.value;
const start=startDate.value;
const end=endDate.value;
const half=document.querySelector('input[name="halfDay"]:checked').value;
const reason=leaveReason.value.trim();

if(!type)return toast("Select Leave Type");
if(!start||!end)return toast("Select Date");
if(start>end)return toast("Invalid Date");

const days=calculateLeaveValue();
if(days<=0)return toast("Invalid Leave");

submitting=true;
btnSubmit.disabled=true;
btnSubmit.innerHTML="Submitting...";

try{

const attachment=await uploadAttachment();
const r=await apiPost({

action:"applyLeave",
leave_type:type,
start_date:start,
end_date:end,
half_day:half,
reason,
attachment

});

if(!r.success)throw r.message;
toast("Leave Submitted");
resetForm();

await loadLeaveSummary();

}catch(e){toast(e.message||e);
}finally{

submitting=false;
btnSubmit.disabled=false;
btnSubmit.innerHTML="Submit Leave";

}

}

function calculateLeaveValue(){

const s=startDate.value;
const e=endDate.value;

if(!s||!e||s>e)return 0;
let d=new Date(s),l=new Date(e),n=0;
while(d<=l){n++;
d.setDate(d.getDate()+1);
}

if(document.querySelector('input[name="halfDay"]:checked').value)
n-=0.5;

return n;

}

function resetForm(){

leaveType.value="";
startDate.value="";
endDate.value="";
leaveReason.value="";
leaveFile.value="";

document.querySelector('input[name="halfDay"][value=""]').checked=true;

leaveDuration.innerHTML="0 Day";
filePreview.innerHTML="";

}

function toast(msg){

if(window.showToast)
showToast(msg);
else
alert(msg);

}
