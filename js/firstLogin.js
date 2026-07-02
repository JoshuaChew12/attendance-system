async function createAccount(){

const empId=document.getElementById("empId").value.trim();
const tempPass=document.getElementById("tempPass").value.trim();
const user=document.getElementById("newUser").value.trim();
const pass=document.getElementById("newPass").value.trim();
const confirm=document.getElementById("confirmPass").value.trim();

const msg=document.getElementById("msg");

if(!empId||!tempPass||!user||!pass||!confirm){
msg.innerHTML="Please fill all fields";
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

if(res.success){

localStorage.removeItem("temp_emp");

alert("Account created successfully.Please login.");

window.location.href="index.html";

}else{

msg.innerHTML=res.message;

}

}

document.addEventListener("DOMContentLoaded",()=>{

const emp=localStorage.getItem("temp_emp");

if(emp){

document.getElementById("empId").value=emp;

}

});
