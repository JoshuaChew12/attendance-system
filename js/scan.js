let qrScanner = null;
let scannedBranch = "";
let isProcessing = false;

// =====================================================
// INIT CAMERA
// =====================================================
async function startScanner(){

console.log("Starting QR Scanner");

const reader=document.getElementById("reader");
if(!reader||qrScanner) return;

qrScanner=new Html5Qrcode("reader");

try{

const cameras=await Html5Qrcode.getCameras();
if(!cameras?.length) throw new Error("No camera found");

// enterprise camera selection
let cameraId=
cameras.find(c=>/back|rear|environment|world/i.test(c.label))?.id
|| cameras[cameras.length-1].id;

await qrScanner.start(cameraId,
{fps:15,qrbox:{width:250,height:250}},
qrSuccess,()=>{});

console.log("Camera Started");

}catch(err){

console.log("Camera Error",err);
showResult({icon:"❌",title:err.message});

}

}

// =====================================================
// QR SUCCESS
// =====================================================
function qrSuccess(decodedText){

if(isProcessing)
return;
isProcessing=true;
scannedBranch =decodedText;

stopScanner();

// hide camera
document.getElementById("cameraPage").style.display="none";

// show result
document.getElementById("resultPage"
).style.display="block";

showResult({
icon:"⏳",
title:"Checking Attendance..."
});

autoAttendance();

}

// =====================================================
// MAIN CONTROLLER
// =====================================================
async function autoAttendance(){

try{

const user =JSON.parse(localStorage.getItem("user"));
if(!user){throw Error("User not found");}

const status =await apiGet({
action:"getTodayAttendance",});
if(status.success &&status.exists){
await checkOut();
}

else{
await checkIn(user);
}

}
catch(err){

showResult({
icon:"❌",
title:err.message
});

}

}

// =====================================================
// CHECK IN
// =====================================================
async function checkIn(){

try{

showResult({icon:"⏳",title:"Getting GPS..."});

const gps=await getLocation();

const result=await apiPost({
action:"checkIn",
qr:scannedBranch,
lat:gps.lat,
lng:gps.lng
});

showResult({
icon:"✅",
title:"CHECK IN SUCCESS",
name:result.data.name,
branch:result.data.branch,
time:result.data.checkIn,
status:result.data.status,
late:result.data.lateMinutes
});
  
}catch(err){

showResult({icon:"❌",title:err.message});

}

}

// =====================================================
// CHECK OUT
// =====================================================
async function checkOut(){

try{

showResult({icon:"⏳",title:"Checking Out..."});

const gps =await getLocation();

const result =await apiPost({
action:"checkOut",
lat:gps.lat,
lng:gps.lng
});

if(result.success){

showResult({
icon:"✅",
title:"CHECK OUT SUCCESS",
time:result.data.checkOut,
workHours:result.data.workHours,
late:result.data.lateMinutes,
earlyLeave:result.data.earlyLeave
});

}
else{
showResult({icon:"❌",title:result.message});
}

}
  
catch(err){
showResult({icon:"❌",title:err.message});
}

}

// =====================================================
// GPS
// =====================================================
function getLocation(){

return new Promise(
(resolve,reject)=>{

if(!navigator.geolocation){
reject(new Error("GPS not supported"));
return;
}

navigator.geolocation.getCurrentPosition(
(position)=>{

resolve({
lat:position.coords.latitude,
lng:position.coords.longitude
});

},

()=>{

reject(new Error("GPS permission denied"));

},

{

maximumAge:0,
enableHighAccuracy:true,
timeout:15000

}

);

}

);

}

// =====================================================
// STOP CAMERA
// =====================================================
async function stopScanner(){

try{

if(qrScanner){

await qrScanner.stop();
await qrScanner.clear();
qrScanner=null;

console.log("Camera stopped");

}

}
catch(err){
console.log("Stop camera error",err);
qrScanner=null;
}

}

// =====================================================
// RESULT UI
// =====================================================
function showResult(data){

document.getElementById("statusIcon").innerHTML =
data.icon || "📷";

document.getElementById("scanResult").innerHTML =
data.title || "";

document.getElementById("scanDetail").innerHTML = `

<div class="scan-card">

${data.name ? `
<div class="scan-name">
${data.name}
</div>` : ""}

${data.branch ? `
<div class="scan-branch">
${data.branch}
</div>` : ""}

${data.time ? `
<div class="scan-row">
<span>Time</span>
<b>${data.time}</b>
</div>` : ""}

${data.status ? `
<div class="scan-row">
<span>Status</span>
<b>${data.status}</b>
</div>` : ""}

${data.late!=null ? `
<div class="scan-row">
<span>Late</span>
<b>${data.late} minute</b>
</div>` : ""}

${data.workHours!=null ? `
<div class="scan-row">
<span>Work Hours</span>
<b>${Number(data.workHours).toFixed(2)} hrs</b>
</div>` : ""}

${data.earlyLeave!=null ? `
<div class="scan-row">
<span>Early Leave</span>
<b>${data.earlyLeave}</b>
</div>` : ""}

</div>

`;

isProcessing=false;

}

// =====================================================
// RESTART
// =====================================================
async function restartScanner(){

document.getElementById("resultPage").style.display="none";
document.getElementById("cameraPage").style.display="block";
isProcessing=false;

await startScanner();

}
