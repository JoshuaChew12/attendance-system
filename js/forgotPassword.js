window.employeeID="";

window.sendOTP=async function(){

const msg=document.getElementById("msg");

msg.style.color="#198754";
msg.innerHTML="";

window.employeeID=document.getElementById("empId").value.trim();
const username=document.getElementById("username").value.trim();
if(!employeeID||!username){
msg.style.color="#d32f2f";
msg.innerHTML="Please fill all fields";
return;
}

const res=await apiPost({

action:"forgotPassword",
employee_id:employeeID,
username

});

if(!res.success){
msg.style.color="#d32f2f";
msg.innerHTML=res.message;
return;
}

document.getElementById("step1").style.display="none";
document.getElementById("step2").style.display="block";
msg.innerHTML="OTP sent to your registered email.";

};

window.resetPassword=async function(){
const msg=document.getElementById("msg");

msg.style.color="#d32f2f";
msg.innerHTML="";

const otp=document.getElementById("otp").value.trim();
const pass=document.getElementById("newPass").value.trim();
const confirm=document.getElementById("confirmPass").value.trim();

if(!otp||!pass||!confirm){
msg.innerHTML="Please fill all fields";
return;
}

if(pass.length<6){
msg.innerHTML="Password must be at least 6 characters";
return;
}

if(pass!=confirm){
msg.innerHTML="Password not match";
return;
}

const verify=await apiPost({

action:"verifyOTP",
employee_id:employeeID,
otp

});

if(!verify.success){
msg.innerHTML=verify.message;
return;
}

const res=await apiPost({

action:"resetPassword",
employee_id:employeeID,
otp,
password:pass

});

if(!res.success){
msg.innerHTML=res.message;
return;
}

alert("Password reset successful.");
location.href="index.html";

};

document.addEventListener("keydown",e=>{
if(e.key!="Enter") return;
document.getElementById("step1").style.display!="none"
?sendOTP()
:resetPassword();

});
