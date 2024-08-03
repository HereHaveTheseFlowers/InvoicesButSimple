import axios from 'axios';
import { authenticationResponse, userCredentials } from './auth.models';
import AuthForm from './AuthForm';
import {urlAccounts} from '../endpoints';
import { useContext, useState } from 'react';
import { DisplayErrors } from '../components'
import { getClaims, saveToken } from './handleJWT';
import AuthenticationContext from './AuthenticationContext';
import { useNavigate } from 'react-router-dom';
import React from 'react';

export default function Login(){

    const [errors, setErrors] = useState<string[]>([]);
    const {update} = useContext(AuthenticationContext);
    const navigate = useNavigate();

    async function login(credentials: userCredentials){
        try {
            setErrors([]);
            const response = await axios
            .post<authenticationResponse>(`${urlAccounts}/login`, credentials);
            saveToken(response.data);
            update(getClaims());
            navigate('/');
        }
        catch (error){
            setErrors([error.response.data]);
        }
    }

    return (
        <>
            <DisplayErrors errors={errors} />
            <AuthForm model={{email: '', password: ''}}
             onSubmit={async values => await login(values)}
            />
        </>
    )
}