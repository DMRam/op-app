import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: 'http://192.168.2.163:3000/api/', // Replace with your machine's local IP address
});