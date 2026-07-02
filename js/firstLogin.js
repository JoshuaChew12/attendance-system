async function createAccount(){

const empId=document.getElementById("empId").value.trim();
const tempPass=document.getElementById("tempPass").value.trim();
const user=document.getElementById("newUser").value.trim();
const pass=document.getElementById("newPass").value.trim();
const confirm=document.getElementById("confirmPass").value.trim();

const msg=document.getElementById("msg");

if(!empId||!tempPass||!user||!pass){

msg.innerHTML="Please fill all fields";
return;

}

if(pass!==confirm){

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

msg.innerHTML="Account created successfully. Please login.";

setTimeout(()=>{

window.location.href="index.html";

},1500);

}else{

msg.innerHTML=res.message;

}

}
