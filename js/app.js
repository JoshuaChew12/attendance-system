/*
==========================
Attendance App Router V2
==========================
*/


let currentPage = null;
let currentScript = null;


// ===============================
// PAGE CONTROLLER
// ===============================

const PageController = {

home:{
    init:loadHome,
    destroy:null
},

scan:{
    init:startScanner,
    destroy:stopScanner
},

calendar:{
    init:loadCalendar,
    destroy:null
}

};




// ===============================
// LOAD PAGE
// ===============================

async function loadPage(page){


/*
DESTROY OLD PAGE
*/

if(currentPage){

const controller =
PageController[currentPage];


if(
controller &&
controller.destroy
){

controller.destroy();

}

}



/*
LOAD HTML
*/


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


content.innerHTML =
html;



content.classList.remove(
"page-animation"
);


void content.offsetWidth;


content.classList.add(
"page-animation"
);



/*
LOAD JS
*/

await loadScript(page);



/*
INIT PAGE
*/

const controller =
PageController[page];


if(
controller &&
controller.init
){

controller.init();

}


currentPage=page;


}




// ===============================
// LOAD SCRIPT
// ===============================

function loadScript(page){


return new Promise(
(resolve)=>{


if(currentScript){

currentScript.remove();

}



const script =
document.createElement(
"script"
);


script.id="page-script";


script.src =
"js/"+page+".js";


script.onload=()=>{

resolve();

};


document.body.appendChild(
script
);



});


}





// ===============================
// LOGIN CHECK
// ===============================

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




// ===============================
// START APP
// ===============================


if(checkLogin()){


loadPage(
"home"
);


}
