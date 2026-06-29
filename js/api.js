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


const query =
new URLSearchParams(params);



const response =
await fetch(
API_URL+"?"+query
);


return await response.json();


}
