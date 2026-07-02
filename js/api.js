async function apiPost(data){

  const token=localStorage.getItem("token");

  if(token && data.action!="login")
  data.token=token;
  
  const formData = new URLSearchParams();

  for(let key in data){
    formData.append(key, data[key]);
  }

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData
  });

  if(result.message=="Unauthorized"){
  localStorage.clear();
  window.location.href="index.html";
  return;
  }
  
  return await response.json();

}


async function apiGet(params){

  const token=localStorage.getItem("token");

  if(token)
  params.token=token;
  
  const query = new URLSearchParams(params);

  const url = API_URL + "?" + query;

  console.log("FETCH URL:", url);

  const response = await fetch(url, {
    method: "GET",
    redirect: "follow"
  });

  const text = await response.text();

  console.log("RAW RESPONSE:", text);

  if(result.message=="Unauthorized"){
  localStorage.clear();
  window.location.href="index.html";
  return;
  }
  
  return JSON.parse(text);

}
