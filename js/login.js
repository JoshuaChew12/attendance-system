async function login(){

const username=document.getElementById("username").value;
const password=document.getElementById("password").value;

const res=await apiPost({
action:"login",
username,
password
});

// ❌ invalid login
if(!res.success && !res.firstLogin){
document.getElementById("msg").innerHTML=res.message;
return;
}

// 🚨 FIRST TIME LOGIN
if(res.firstLogin){

localStorage.setItem("temp_emp",res.employee_id);

window.location.href="firstLogin.html";

return;

}

// ✅ NORMAL LOGIN
localStorage.setItem("user",JSON.stringify(res.user));
localStorage.setItem("token",res.token);

window.location.href="app.html";

}
