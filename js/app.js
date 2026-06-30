// =====================================================
// PAGE CONTROLLER
// =====================================================

const PageController = {

    home:{
        script:"home.js",
        show:"onHomeShow",
        hide:"onHomeHide"
    },

    scan:{
        script:"scan.js",
        show:"onScanShow",
        hide:"onScanHide"
    },

    calendar:{
        script:"calendar.js",
        show:"onCalendarShow",
        hide:"onCalendarHide"
    }

};


let currentPage = null;


// =====================================================
// LOAD PAGE
// =====================================================

function loadPage(page){


    // ===============================
    // HIDE CURRENT PAGE
    // ===============================

    if(currentPage){

        const old =
        PageController[currentPage];

        if(
            old &&
            typeof window[old.hide] === "function"
        ){

            window[old.hide]();

        }

    }



    // ===============================
    // LOAD HTML
    // ===============================

    showPage(page);



    // ===============================
    // LOAD SCRIPT
    // ===============================

    const config =
    PageController[page];


    if(!config)
    return;



    const oldScript =
    document.getElementById(
        "page-script"
    );


    if(oldScript){
        oldScript.remove();
    }



    const script =
    document.createElement(
        "script"
    );


    script.id="page-script";


    script.src =
    "js/"+config.script;



    script.onload=function(){


        currentPage = page;


        if(
            typeof window[config.show]
            ===
            "function"
        ){

            window[config.show]();

        }

    };


    document.body.appendChild(script);


}



// =====================================================
// PAGE DISPLAY
// =====================================================

function showPage(page){


    document
    .querySelectorAll(".page")
    .forEach(
        p=>{
            p.style.display="none";
        }
    );


    const target =
    document.getElementById(
        page+"Page"
    );


    if(target){

        target.style.display="block";

    }

}



// =====================================================
// START APP
// =====================================================

document.addEventListener(
"DOMContentLoaded",
()=>{

    loadPage("home");

});
