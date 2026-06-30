async function loadHome(){

const user =
JSON.parse(
localStorage.getItem("user")
);

if(!user){
return;
}

// ===============================
// USER INFO
// ===============================
document.getElementById(
"employeeName"
).innerHTML =
user.employee_name || user.employee_id;

document.getElementById(
"branchName"
).innerHTML =
user.branch_name || user.branch_id;

// ===============================
// DASHBOARD
// ===============================
try{

const dash =
await apiGet({
action:"getDashboard",
branch:user.branch_id
});

if(dash.success){

document.getElementById(
"present"
).innerHTML =
dash.data.present;

document.getElementById(
"late"
).innerHTML =
dash.data.late;

}

}catch(err){

console.log(
"Dashboard Error",
err
);

}

// ===============================
// TODAY ATTENDANCE
// ===============================
try{

const today =
await apiGet({
action:"getTodayAttendance",
employee_id:user.employee_id
});

if(
today.success &&
today.exists
){

const record =
today.record;

document.getElementById(
"checkIn"
).innerHTML =
record.checkIn || "--:--";

document.getElementById(
"checkOut"
).innerHTML =
record.checkOut || "--:--";

if(record.checkOut){

document.getElementById(
"statusText"
).innerHTML =
"Completed";

}

else{

document.getElementById(
"statusText"
).innerHTML =
"Working";

}

}

else{

document.getElementById(
"checkIn"
).innerHTML =
"--:--";

document.getElementById(
"checkOut"
).innerHTML =
"--:--";

document.getElementById(
"statusText"
).innerHTML =
"Not Started";

}

}catch(err){

console.log(
"Today Attendance Error",
err
);

document.getElementById(
"statusText"
).innerHTML =
"Error";

}

}

// =====================================================
// AUTO REFRESH
// =====================================================

// When return from Scan
window.addEventListener(
"focus",
()=>{
loadHome();
}

);

// When page loaded
loadHome();
