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
  putCity: async (data: Partial<City>) => {
    return await instance
      .put(buildUrl(`/${data.id}`), data)
      .then((response) => response.data);
  },
  postImageByIdCity: async (id: string, data: FormData) => {
    return await instance
      .post(buildUrl(`/${id}/upload-image`), data)
      .then((response) => response.data);
  },
  deleteCity: async (id: number) => {
    return await instance
      .delete(buildUrl(`/${id}`))
      .then((response) => response.data);
  },
};
