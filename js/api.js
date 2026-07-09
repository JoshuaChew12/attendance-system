async function apiPost(data){

  const token = localStorage.getItem("token");
  if(token && data.action!="login") data.token = token;

  const res = await fetch(API_URL,{
    method:"POST",
    body:new URLSearchParams(data)
  });

  const result = await res.json();

  if(result.message=="Unauthorized"){
    localStorage.clear();
    window.location.href="index.html";
    return;
  }

  return result;
}


async function apiGet(params){

  const token = localStorage.getItem("token");
  if(token) params.token = token;

  const res = await fetch(API_URL+"?"+new URLSearchParams(params));
  const result = await res.json();

  if(result.message=="Unauthorized"){
    localStorage.clear();
    window.location.href="index.html";
    return;
  }

  return result;
}
