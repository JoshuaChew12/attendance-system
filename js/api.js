async function apiPost(data){

  const formData = new URLSearchParams();

  for(let key in data){
    formData.append(key, data[key]);
  }

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData
  });

  return await response.json();

}


async function apiGet(params){

  const query = new URLSearchParams(params);

  const url = API_URL + "?" + query;

  console.log("FETCH URL:", url);

  const response = await fetch(url, {
    method: "GET",
    redirect: "follow"
  });

  const text = await response.text();

  console.log("RAW RESPONSE:", text);

  return JSON.parse(text);

}
