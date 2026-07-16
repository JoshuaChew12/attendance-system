var leaveBalanceData=[];
var submitting=false;

async function loadLeaveApply(){

bindLeaveEvent();
await loadLeaveType();
await loadLeaveSummary();

}

function bindLeaveEvent(){

startDate.onchange = calculateDays;
endDate.onchange = calculateDays;

document
.querySelectorAll('input[name="halfDay"]')
.forEach(x=>{x.onchange = calculateDays;});

leaveFile.onchange = previewFile;

}

async function loadLeaveType(){

leaveType.innerHTML='<option value="">Select Leave Type</option>';
const r=await apiGet({action:"getLeaveTypeList"});
if(!r.success)return;

r.data.forEach(x=>{
let o=document.createElement("option");
o.value=x.id;
o.textContent=x.name;
leaveType.appendChild(o);
});

}

async function loadLeaveSummary(){

const user=JSON.parse(localStorage.getItem("user")||"{}");

if(!user.employee_id)return;

const r=await apiGet({
action:"getLeaveSummary",
employee_id:user.employee_id,
year:new Date().getFullYear()
});

if(!r.success)return;
leaveBalanceData=r.data||[];

renderBalance();

}

function renderBalance(){

leaveBalance.innerHTML=
leaveBalanceData.map(x=>`

<div class="balance-card">
<b>${x.leave_type}</b><br>
Entitled : ${x.entitled}<br>
Used : ${x.used}<br>
Pending : ${x.pending}<br>
Balance :<strong>${x.balance}</strong>

</div>

`).join("");

}

async function calculateDays(){

const start = startDate.value;
const end = endDate.value;

if(!start || !end){leaveDuration.innerHTML = "0 Day";
return;}
if(start > end){leaveDuration.innerHTML = "Invalid Date";
return;}

const halfDay = document.querySelector('input[name="halfDay"]:checked').value;

try{
const r = await apiGet({
action:"checkLeaveDays",
start_date:start,
end_date:end,
half_day:halfDay
});

if(!r.success){leaveDuration.innerHTML = r.message || "Error";
return;}

const days = Number(r.days || 0);
leaveDuration.innerHTML =days +(days > 1 ? " Days" : " Day");

}catch(err){leaveDuration.innerHTML = "Error";}

}

function previewFile(){

let f=leaveFile.files[0];
if(!f){filePreview.innerHTML="";
return;
}

if(f.size>5*1024*1024){
toast("File too large");
leaveFile.value="";
return;
}

filePreview.innerHTML="✔️ "+f.name;

}

async function uploadAttachment(){

let f=leaveFile.files[0];
if(!f)return "";
return new Promise((resolve,reject)=>{

let reader=new FileReader();
reader.onload=async()=>{

try{

let r=await apiPost({
action:"uploadLeaveAttachment",
file:reader.result,
filename:f.name
});

if(r.success)
resolve(r.url||"");
else
reject(r.message);

}catch(e){reject(e);}

};

reader.readAsDataURL(f);

});

}

async function submitLeave(){

if(submitting)return;
let days=calculateLeaveValue();

if(!leaveType.value)
return toast("Select Leave Type");
if(!startDate.value||
!endDate.value)
return toast("Select Date");
if(days<=0)
return toast("Invalid Leave");

submitting=true;
btnSubmit.disabled=true;
btnSubmit.innerHTML="Submitting...";

try{

let attachment=await uploadAttachment();
let r=await apiPost({

action:"applyLeave",
leave_type:leaveType.value,
start_date:startDate.value,
end_date:endDate.value,
half_day:document.querySelector('input[name="halfDay"]:checked').value,
reason:leaveReason.value.trim(),
attachment

});

if(!r.success)
throw r.message;
toast("Leave Submitted");
resetForm();
await loadLeaveSummary();

}
catch(e){toast(e.message||e);}
finally{
submitting=false;
btnSubmit.disabled=false;
btnSubmit.innerHTML="Submit Leave";
}

}

function calculateLeaveValue(){

const text = leaveDuration.innerText || "";
const value = parseFloat(text);
return isNaN(value) ? 0 : value;

}

function resetForm(){

leaveType.value="";
startDate.value="";
endDate.value="";
leaveReason.value="";
leaveFile.value="";

document
.querySelector('input[name="halfDay"][value=""]')
.checked=true;

leaveDuration.innerHTML="0 Day";
filePreview.innerHTML="";

}

function toast(msg){

if(window.showToast)
showToast(msg);
else
alert(msg);

}
