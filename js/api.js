/* =====================================
   API
===================================== */
async function apiPost(data){

  const token=localStorage.getItem("token");

  if(token&&data.action!="login")
    data.token=token;

  try{

    const res=await fetch(API_URL,{
      method:"POST",
      body:new URLSearchParams(data)
    });

    return await handleAPIResponse(
      res,
      "POST",
      data.action
    );

  }catch(e){

    console.error(
      "API NETWORK ERROR:",
      data.action,
      e
    );

    return{
      success:false,
      error:true,
      type:"NETWORK_ERROR",
      message:"Network error. Please try again."
    };

  }

}

/* =====================================
   GET
===================================== */
async function apiGet(params){

  const token=localStorage.getItem("token");

  if(token)
    params.token=token;

  try{

    const res=await fetch(
      API_URL+"?"+new URLSearchParams(params)
    );

    return await handleAPIResponse(
      res,
      "GET",
      params.action
    );

  }catch(e){

    console.error(
      "API NETWORK ERROR:",
      params.action,
      e
    );

    return{
      success:false,
      error:true,
      type:"NETWORK_ERROR",
      message:"Network error. Please try again."
    };

  }

}

/* =====================================
   HANDLE API RESPONSE
===================================== */
async function handleAPIResponse(res,method,action){

  const text=await res.text();

  let result;

  /* JSON PARSE */
  try{

    result=JSON.parse(text);

  }catch(e){

    console.error(
      "API JSON ERROR:",
      method,
      action,
      "HTTP:",
      res.status,
      text
    );

    return{
      success:false,
      error:true,
      type:"SERVER_ERROR",
      message:"Server response error."
    };

  }

  /* =====================================
     UNAUTHORIZED
     ONLY HERE → SESSION EXPIRED
  ===================================== */
  if(
    result.code=="AUTH_REQUIRED"||
    result.message=="Unauthorized"
  ){

    console.warn(
      "SESSION EXPIRED:",
      action
    );

    handleSessionExpired();

    return{
      success:false,
      error:true,
      type:"UNAUTHORIZED",
      message:"Session expired."
    };

  }

  /* =====================================
     SERVER ERROR
  ===================================== */
  if(
    res.status>=500||
    result.error===true
  ){

    console.error(
      "API SERVER ERROR:",
      method,
      action,
      "HTTP:",
      res.status,
      result
    );

    return{
      success:false,
      error:true,
      type:"SERVER_ERROR",
      message:
        result.message||
        "Server error. Please try again."
    };

  }

  /* =====================================
     NORMAL API RESPONSE
  ===================================== */
  return result;

}

/* =====================================
   SESSION EXPIRED
===================================== */
function handleSessionExpired(){

  /* Prevent multiple redirects */
  if(window.sessionExpiredHandled)
    return;

  window.sessionExpiredHandled=true;

  /* Remove authentication only */
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  /*
    Small delay so the current API
    can finish cleanly before redirect.
  */

  setTimeout(()=>{

    alert("Your session has expired. Please login again.");

    window.location.href="index.html";

  },100);

}
