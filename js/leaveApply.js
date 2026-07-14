let leaveTypes=[];

async function loadLeaveApply(){

await loadLeaveTypes();

// 从 Calendar 传来的日期
const start =sessionStorage.getItem("leave_start");
const end =sessionStorage.getItem("leave_end");

if(start)
document.getElementById("startDate").value=start;

if(end)
document.getElementById("endDate").value=end;

calculateLeaveDays();

}

async function loadLeaveTypes(){

const select=document.getElementById("leaveType");

try{

const res=await apiGet({
action:"getLeaveTypes"
});

if(!res.success)
return;

leaveTypes=res.data||[];
select.innerHTML=
`
<option value="">
Select Leave Type
</option>
`;

leaveTypes.forEach(x=>{

const option=document.createElement("option");
option.value=x.id;
option.textContent=x.name;
select.appendChild(option);

});

}
catch(e){
console.log("Leave Type Error",e);
}

}

function calculateLeaveDays(){

const start=document.getElementById("startDate").value;
const end=document.getElementById("endDate").value;
const box=document.getElementById("leaveDays");

if(!start||!end){

box.innerHTML="Total Leave : 0 Day";
return;

}

const s=new Date(start);
const e=new Date(end);
if(e<s){

box.innerHTML="Invalid Date";
return;

}

const diff=Math.floor((e-s)/(1000*60*60*24))+1;
box.innerHTML=`Total Leave :${diff}Day`;

}

async function submitLeave(){

const leaveType=document.getElementById("leaveType").value;
const start=document.getElementById("startDate").value;
const end=document.getElementById("endDate").value;
const reason=document.getElementById("reason").value.trim();

if(!leaveType){

alert("Please select leave type");
return;

}
  
if(!start||!end){

alert("Please select date");
return;

}

if(new Date(end)<new Date(start)){

alert("End date cannot before start date");
return;

}

const btn=event.target;
btn.disabled=true;
btn.innerHTML="Submitting...";

try{

const res=await apiPost({
action:"applyLeave",
leave_type:leaveType,
start_date:start,
end_date:end,
reason:reason
});

if(!res.success){

alert(res.message);
btn.disabled=false;
btn.innerHTML="📨 Submit Leave";
return;

}

alert("Leave submitted successfully");

// 清除 Calendar 暂存日期
sessionStorage.removeItem("leave_start");
sessionStorage.removeItem("leave_end");

loadPage("calendar");

}
catch(e){console.log(e);

alert("System Error");
btn.disabled=false;
btn.innerHTML="📨 Submit Leave";

}

}

document.addEventListener("change",
e=>{

if(e.target.id=="startDate"||e.target.id=="endDate")

calculateLeaveDays();

});
