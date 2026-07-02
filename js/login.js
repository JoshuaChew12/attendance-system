async function login(){

const username =
document.getElementById("username").value;


const password =
document.getElementById("password").value;


console.log(
"send:",
username,
password
);


const result =
await apiPost({

action:"login",

username:username,

password:password

});


console.log(
"response:",
result
);



if(result.success){


localStorage.setItem(
"user",
JSON.stringify(result.user)
);

localStorage.setItem(
"token",
result.token
);

window.location.href=
"app.html";


}else{


document.getElementById("msg").innerHTML=
result.message;


}

}
