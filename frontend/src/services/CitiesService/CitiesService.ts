import { instance } from "../../instance/instance";
import UrlBuilder from "../../utils/UrlBuilder";

const PATH = "/cities";
const { buildUrl } = new UrlBuilder(PATH);

export const CitiesService = {
  getCities: async () => {
    return await instance.get(buildUrl("")).then((response) => response.data);
  },
};
