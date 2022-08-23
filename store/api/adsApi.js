import { handleResponse, handleError } from "./apiUtils";
const baseUrl =  "https://imuat.saadiadirect.com/ftf/plcc/makesale";


export function sales3x() {
  return fetch(baseUrl , {
    method:  "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify("")
  })
    .then(handleResponse)
    .catch(handleError);
}
