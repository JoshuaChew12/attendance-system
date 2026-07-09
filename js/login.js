async function login(){

const msg=document.getElementById("msg");
msg.innerHTML="";

const username=document.getElementById("username").value.trim();
const password=document.getElementById("password").value.trim();

if(!username||!password){
msg.innerHTML="Please enter username and password";
return;
}

const res=await apiPost({

action:"login",
username,
password,
ip:"",
device:navigator.userAgent

});

if(!res.success){
msg.innerHTML=res.message;
return;
}

localStorage.setItem("user",JSON.stringify(res.user));
localStorage.setItem("token",res.token);

location.href="app.html";
}

document.addEventListener("keydown",e=>{
if(e.key=="Enter") login();
});
