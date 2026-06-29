async function login(){

try{


const username =
document.getElementById("username").value;


const password =
document.getElementById("password").value;


console.log(username,password);



const result =
await apiPost({

action:"login",

username:username,

password:password

});


console.log(result);



if(result.success){


localStorage.setItem(
"user",
JSON.stringify(result.user)
);


window.location.href="dashboard.html";


}else{


document.getElementById("msg").innerHTML=
result.message;


}



}catch(error){

console.error(error);


document.getElementById("msg").innerHTML=
error.message;


}

}
