/* =====================================
   LOGIN
===================================== */
window.loginLoading=false;

async function login(){

if(window.loginLoading)return;

window.loginLoading=true;

const msg=document.getElementById("msg");
const btn=document.getElementById("loginBtn");

if(msg)msg.innerHTML="";

const username=document.getElementById("username").value.trim();
const password=document.getElementById("password").value.trim();

if(!username||!password){

if(msg)
msg.innerHTML="Please enter username and password";

window.loginLoading=false;
return;

}

if(btn){
btn.disabled=true;
btn.innerText="Logging in...";
}

try{

const res=await apiPost({
action:"login",
username,
password,
ip:"",
device:navigator.userAgent
});

if(!res){

if(msg)
msg.innerHTML="Login failed. Please try again.";

return;
}

if(!res.success){

if(msg)
msg.innerHTML=res.message||"Login failed.";

return;
}

/* =====================================
   LOGIN SUCCESS
===================================== */
localStorage.setItem("user",JSON.stringify(res.user));
localStorage.setItem("token",res.token);
window.location.replace("app.html");

}catch(e){

console.error("LOGIN ERROR:",e);

if(msg)
msg.innerHTML="Login failed. Please try again.";

}finally{

window.loginLoading=false;

if(btn){
btn.disabled=false;
btn.innerText="Login";
}

}

}

/* =====================================
   LOGIN BUTTON
===================================== */
document
.getElementById("loginBtn")
.addEventListener("click",login);

/* =====================================
   ENTER KEY
===================================== */
document.addEventListener("keydown",e=>{

if(e.key!=="Enter")return;
const tag=e.target?.tagName;

if(tag==="INPUT"){
e.preventDefault();
login();
}

});
