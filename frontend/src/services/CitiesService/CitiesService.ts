import { instance } from "../../instance/instance";
import type { City } from "../../types/types";
import UrlBuilder from "../../utils/UrlBuilder";

const PATH = "/cities";
const { buildUrl } = new UrlBuilder(PATH);

export const CitiesService = {
  getCities: async () => {
    return await instance
      .get<City[]>(buildUrl(""))
      .then((response) => response.data);
  },
  postCity: async (formData: FormData) => {
    return await instance
      .post(buildUrl(""), formData)
      .then((response) => response.data);
  },
};
