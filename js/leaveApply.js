const LEAVE_API = window.API_URL || "";

let leaveBalanceData = [];
let attachmentURL = "";
let submitting = false;

// =====================================================
// INIT
// =====================================================
document.addEventListener("DOMContentLoaded",()=>{
loadLeaveType();
loadLeaveSummary();

document
.getElementById("startDate")
.addEventListener("change",calculateDays);

document
.getElementById("endDate")
.addEventListener("change",calculateDays);

document
.querySelectorAll('input[name="halfDay"]')
.forEach(x=>x.addEventListener(
"change",
calculateDays
));

document
.getElementById("leaveFile")
.addEventListener(
"change",
previewFile
);

});

// =====================================================
// API CALL
// =====================================================
async function apiPost(action,data={}){

const token=sessionStorage.getItem("token");
data.action=action;
data.token=token||"";
const res=await fetch(
LEAVE_API,
{
method:"POST",
headers:{
"Content-Type":
"application/x-www-form-urlencoded"
},
body:new URLSearchParams(data)
}
);

return await res.json();

}


async function apiGet(action,data={}){

const token=sessionStorage.getItem("token");
data.action=action;
data.token=token||"";
const q=new URLSearchParams(data);
const res=await fetch(LEAVE_API+"?"+q);
return await res.json();

}

// =====================================================
// LOAD LEAVE TYPE
// =====================================================
async function loadLeaveType(){

const select=document.getElementById("leaveType");
select.innerHTML='<option value="">Select Leave Type</option>';

const r=await apiGet("getLeaveTypeList");
if(!r.success)
return;

r.data.forEach(x=>{
const o=document.createElement("option");
o.value=x.id;
o.textContent=
x.name;
select.appendChild(o);
});


}

// =====================================================
// LOAD LEAVE BALANCE
// =====================================================
async function loadLeaveSummary(){
const box=document.getElementById("leaveBalance");
const emp=JSON.parse(sessionStorage.getItem("user")||"{}");
if(!emp.employee_id)
return;
const year=new Date().getFullYear();

try{
const r=await apiGet("getLeaveSummary",{
employee_id:
emp.employee_id,
year
}
);

if(!r.success)
return;
leaveBalanceData=r.data||[];
renderBalance();
}catch(e){console.log(e);}

}

// =====================================================
// RENDER BALANCE
// =====================================================
function renderBalance(){

const box=document.getElementById("leaveBalance");
if(!leaveBalanceData.length){
box.innerHTML="";
return;
}

box.innerHTML=leaveBalanceData.map(x=>`
<div class="balance-card">
<b>${x.leave_type}</b>
<br>Entitled:${x.entitled}
<br>Used:${x.used}
<br>Pending:${x.pending}
<br>Balance:<strong>${x.balance}</strong>
</div>
`).join("");

}

// =====================================================
// DATE CALCULATION
// =====================================================
function calculateDays(){

const start=document.getElementById("startDate").value;
const end=document.getElementById("endDate").value;
const box=document.getElementById("leaveDuration");

if(!start||!end){box.innerHTML="0 Day";
return;
}

if(start>end){box.innerHTML="Invalid Date";
return;
}

let d=new Date(start);
const last=new Date(end);
let count=0;
while(d<=last){count++;
d.setDate(d.getDate()+1);

}

const half=document
.querySelector('input[name="halfDay"]:checked')
.value;
if((half=="AM"||half=="PM")&&count>0)
count-=0.5;
box.innerHTML=count+(count>1?" Days":" Day");

}

// =====================================================
// FILE PREVIEW
// =====================================================
function previewFile(){

const file=document.getElementById("leaveFile").files[0];
const box=document.getElementById("filePreview");

if(!file){box.innerHTML="";
return;
}
  
if(file.size>5*1024*1024){
alert("File too large (Max 5MB)");
document
.getElementById("leaveFile")
.value="";
return;
}

box.innerHTML=`✔️ ${file.name}`;

}

// =====================================================
// UPLOAD ATTACHMENT
// =====================================================
async function uploadAttachment(){

const input=document.getElementById("leaveFile");
if(!input.files.length)
return "";
const file=input.files[0];
return new Promise((resolve,reject)=>{
const reader=new FileReader();

reader.onload=async()=>{

try{
const r=await apiPost("uploadLeaveAttachment",
{file:reader.result});

if(r.success)
resolve(r.url);
else
reject(r.message);

}catch(e){reject(e);}

};

reader.readAsDataURL(file);

});

}

// =====================================================
// SUBMIT LEAVE
// =====================================================
async function submitLeave(){

if(submitting)
return;

const type=document
.getElementById("leaveType")
.value;

const start=document
.getElementById("startDate")
.value;

const end=document
.getElementById("endDate")
.value;

const reason=document
.getElementById("leaveReason")
.value.trim();

const half=document
.querySelector('input[name="halfDay"]:checked')
.value;

// ===============================
// VALIDATION
// ===============================
if(!type){
toast("Please select leave type");
return;
}

if(!start||!end){
toast("Please select date");
return;
}

if(start>end){
toast("Invalid date range");
return;
}

const days=calculateLeaveValue();
if(days<=0){
toast("No working days");
return;
}

// ===============================
// BUTTON LOCK
// ===============================
submitting=true;

const btn=document.getElementById("btnSubmit");
if(btn){
btn.disabled=true;
btn.innerHTML="Submitting...";
}

try{
// ===============================
// UPLOAD FILE
// ===============================
let attachment="";
if(document
.getElementById("leaveFile")
.files.length
){
attachment=await uploadAttachment();
}

// ===============================
// APPLY LEAVE
// ===============================
const r=await apiPost("applyLeave",
{
leave_type:type,
start_date:start,
end_date:end,
half_day:half,
reason,
attachment
}
);

if(!r.success){throw r.message;}

// ===============================
// SUCCESS
// ===============================
toast("Leave Submitted");
resetForm();
await loadLeaveSummary();

}catch(e){toast(e.message||e);}finally{
submitting=false;

if(btn){
btn.disabled=false;
btn.innerHTML="Submit Leave";
}

}

}

// =====================================================
// CALCULATE VALUE
// =====================================================
function calculateLeaveValue(){

const start=document
.getElementById("startDate")
.value;

const end=document
.getElementById("endDate")
.value;

if(!start||!end)
return 0;

let count=0;
let d=new Date(start);
const last=new Date(end);
while(d<=last){
count++;
d.setDate(d.getDate()+1);
}

const half=document
.querySelector('input[name="halfDay"]:checked')
.value;

if(half=="AM"||half=="PM")
count-=0.5;
return count;

}

// =====================================================
// RESET FORM
// =====================================================
function resetForm(){

document
.getElementById("leaveType")
.value="";

document
.getElementById("startDate")
.value="";

document
.getElementById("endDate")
.value="";

document
.getElementById("leaveReason")
.value="";

document
.getElementById("leaveFile")
.value="";

document
.querySelector('input[name="halfDay"][value=""]')
.checked=true;

document
.getElementById("leaveDuration")
.innerHTML="0 Day";

document
.getElementById("filePreview")
.innerHTML="";

}

// =====================================================
// TOAST
// =====================================================
function toast(msg){

if(window.showToast){showToast(msg);
return;
}

alert(msg);

}
