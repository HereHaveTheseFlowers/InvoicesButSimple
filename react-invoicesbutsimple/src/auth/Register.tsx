import axios from "axios";
import { authenticationResponse, userCredentials } from "./auth.models";
import { useContext, useState } from "react";
import { DisplayErrors } from '../components'
import AuthForm from "./AuthForm";
import { getClaims, saveToken } from "./handleJWT";
import AuthenticationContext from "./AuthenticationContext";
import { useNavigate } from "react-router-dom";

export default function Register(){

    const [errors, setErrors] = useState<string[]>([]);
    const {update} = useContext(AuthenticationContext);
    const navigate = useNavigate();

    async function register(credentials: userCredentials){
        try{
            setErrors([]);
            const response = await axios
                .post<authenticationResponse>(`https://localhost:7267/api/accounts/create`, credentials)
            saveToken(response.data);
            update(getClaims());
            navigate('/');
        }
        catch(error){
            setErrors(error.response.data);
        }
    }

    return (
        <>
            <DisplayErrors errors={errors} />
            <AuthForm
            model={{email: '', password: ''}}
            onSubmit={async values => await register(values)}
            />
        </>
    )
}