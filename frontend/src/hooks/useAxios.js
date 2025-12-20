// This is simply exposing the axios instance, or could wrap useMemo
import api from '../api/axiosInstance';

const useAxios = () => {
    return api;
};

export default useAxios;
