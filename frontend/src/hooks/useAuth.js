import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

// A helper hook to easily access authentication state in any component.
const useAuth = () => {
    return useContext(AuthContext);
};

export default useAuth;

