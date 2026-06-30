/*
==========================
Attendance App Router
==========================
*/


async function loadPage(page){


const response =
await fetch(
"pages/"+page+".html"
);


const html =
await response.text();


const content =
document.getElementById(
"content"
);


content.innerHTML=html;



await loadScript(page);

if(PageInit[page]){

PageInit[page]();

}


}





function loadScript(page){

return new Promise((resolve)=>{

const old =
document.getElementById(
"page-script"
);

if(old){
old.remove();
}

const script =
document.createElement(
"script"
);

script.id="page-script";

script.src =
"js/"+page+".js";

script.onload=function(){

resolve();

};

script.onerror=function(){

console.log(
"Load JS Error:",
page
);

resolve();

};


document.body.appendChild(script);

});

}






// Login Check


function checkLogin(){


const user =
localStorage.getItem(
"user"
);



if(!user){


window.location.href=
"index.html";


return false;


}


return true;


}





// Start App


if(checkLogin()){


loadPage(
"home"
);


}
