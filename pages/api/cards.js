// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { handleResponse, handleError } from "../../store/api/apiUtils";
//const baseUrl =  "https://imuat.saadiadirect.com/ftf/plcc/";
const baseUrl =  "http://localhost:8080/plcc/";

export default async function handler(req, res) {
  console.log(req.body.email)
  return fetch(baseUrl + "fetchcards?email="+req.body.email , {
    method:  "POST", // POST for create, PUT to update when id already exists.
  })
    .then(resp=>resp.json()).then((resp) => res.status(200).json(resp))
    .catch(handleError);
}
