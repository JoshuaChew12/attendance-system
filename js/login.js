async function login(){


const username =
document
.getElementById("username")
.value;


const password =
document
.getElementById("password")
.value;



const result =
await apiPost({

action:"login",

username,

password


});



if(result.success){


localStorage.setItem(
"user",
JSON.stringify(result.user)
);



window.location.href=
"dashboard.html";



}else{


document
.getElementById("msg")
.innerHTML=
result.message;


}



}
