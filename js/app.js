/*
==========================
Attendance App Router
==========================
*/


function loadPage(page){


fetch(
"pages/"+page+".html"
)


.then(
response=>response.text()
)


.then(
html=>{


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




loadScript(page);



});


}



const PageController = {
  home: loadHome,
  scan: initScanPage,
  calendar: initCalendarPage
};

const PageDestroy = {
  scan: destroyScanPage,
  calendar: destroyCalendarPage
};

function loadScript(page) {

  const old = document.getElementById("page-script");

  if (old) {
    const prev = old.dataset.page;
    if (PageDestroy[prev]) {
      PageDestroy[prev]();
    }
    old.remove();
  }

  const script = document.createElement("script");
  script.id = "page-script";
  script.dataset.page = page;
  script.src = "js/" + page + ".js";

  script.onload = function () {
    if (PageController[page]) {
      PageController[page]();
    }
  };

  document.body.appendChild(script);
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
