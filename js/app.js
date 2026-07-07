/*
==========================
Attendance App Router
==========================
*/
let currentPage = null;

// LOAD PAGE
async function loadPage(page){

// destroy old page
if(currentPage==="scan" && typeof stopScanner==="function"){
await stopScanner();
}

// load html
const response =
await fetch("pages/"+page+".html");

const html =
await response.text();

document.getElementById("content").innerHTML =
html;

// load js
await loadScript(page);

// init page
if(PageInit[page]){
await PageInit[page]();
}

currentPage = page;

}

// LOAD SCRIPT
function loadScript(page){

return new Promise((resolve)=>{

const old =
document.getElementById("page-script");

if(old)
old.remove();

const script =
document.createElement("script");

script.id="page-script";
script.src="js/"+page+".js";

script.onload=()=>resolve();

script.onerror=()=>{
console.log("Load JS Error:",page);
resolve();
};

document.body.appendChild(script);

});

}

// LOGIN CHECK
function checkLogin(){

const user =
localStorage.getItem("user");

if(!user){
window.location.href="index.html";
return false;
}

return true;

}

// PAGE INIT
const PageInit={

home:async()=>{

if(typeof loadHome==="function")
await loadHome();

},

scan:async()=>{

if(typeof startScanner==="function")
await startScanner();

},

calendar:async()=>{

if(typeof loadCalendar==="function")
await loadCalendar();

},

profile:async()=>{

if(typeof loadProfile==="function")
await loadProfile();

},

updateProfile:async()=>{

if(typeof loadUpdateProfile==="function")
await loadUpdateProfile();

}

report:async()=>{

if(typeof loadReport==="function")
await loadReport();

}

};

// START APP
if(checkLogin()){

loadPage("home");

}
