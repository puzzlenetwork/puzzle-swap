import axios from "axios";

const bucketService = {
  upload: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type);
    const url = `https://puzzle-js-back-dev-bba0bd77a60c.herokuapp.com/api/v1/bucket/upload`;
    const headers = { "Content-Type": "multipart/form-data" };
    const { data } = await axios.post(url, formData, { headers });
    return data;
  },
};
export default bucketService;
