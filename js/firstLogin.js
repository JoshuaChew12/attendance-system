async function createAccount(){

const msg=document.getElementById("msg");

msg.innerHTML="";

const empId=document.getElementById("empId").value.trim();
const tempPass=document.getElementById("tempPass").value.trim();
const user=document.getElementById("newUser").value.trim();
const pass=document.getElementById("newPass").value.trim();
const confirm=document.getElementById("confirmPass").value.trim();

if(!empId||!tempPass||!user||!pass||!confirm){
msg.innerHTML="Please fill all fields";
return;
}

if(user.length<4){
msg.innerHTML="Username must be at least 4 characters";
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

const res=await apiPost({

action:"createAccount",
employee_id:empId,
temp_password:tempPass,
username:user,
password:pass

});

if(!res.success){
msg.innerHTML=res.message;
return;
}

localStorage.removeItem("temp_emp");
alert("Account created successfully.");
location.href="index.html";

}

document.addEventListener("DOMContentLoaded",()=>{

const emp=localStorage.getItem("temp_emp");
if(emp)
document.getElementById("empId").value=emp;

});

document.addEventListener("keydown",e=>{
if(e.key=="Enter")
createAccount();

});
