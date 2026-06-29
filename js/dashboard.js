async function loadDashboard(){


try{


const user =
JSON.parse(
localStorage.getItem("user")
);



if(!user){

window.location.href="index.html";

return;

}



const result =
await apiGet({

action:"getDashboard",

branch:user.branch_id

});



console.log(result);



if(result.success){


document
.getElementById("present")
.innerHTML =
result.data.present;



document
.getElementById("late")
.innerHTML =
result.data.late;


}else{


document
.getElementById("msg")
.innerHTML =
result.message;


}



}catch(error){


console.error(error);


document
.getElementById("msg")
.innerHTML =
error.message;


}



}



function goCheck(){

window.location.href=
"checkin.html";

}



function logout(){

localStorage.removeItem("user");

window.location.href=
"index.html";

}



loadDashboard();
