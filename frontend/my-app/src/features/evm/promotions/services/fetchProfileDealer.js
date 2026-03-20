import apiConst from "../../../../services/apiConst.js";

export const fetchProfileDealer = {
  // Basic CRUD
  getProfile: () =>
    apiConst.post("/users/profile", {id_user: sessionStorage.getItem("id_user")}),
};

export default fetchProfileDealer;
