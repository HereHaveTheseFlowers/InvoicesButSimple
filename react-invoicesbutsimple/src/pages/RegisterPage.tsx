import React, { useContext } from "react";
import Register from "../auth/Register";
import Authorized from "../auth/Authorized";
import { Button } from "../components";
import { logout } from "../auth/handleJWT";
import AuthenticationContext from "../auth/AuthenticationContext";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const {update, claims} = useContext(AuthenticationContext)
    const navigate = useNavigate();
    return (
        <>
            <h1>Регистрация</h1>
            <Authorized
                authorized={<>
                    <span className="nav-link">Вы уже зарегистрированы!</span>
                    <Button
                    onClick={() => {
                        logout();
                        update([]);
                        navigate('/')
                    }}
                    className="nav-link btn btn-link"
                    >Выйти</Button>
                    <Button onClick={()=>(navigate('/'))}>Назад</Button>
                </>}
                notAuthorized={<>
                <div className="row justify-content-center">
                    <div className="col-5 ">
                        <Register></Register>
                    </div>
                </div>
                </>}
            />
        </>
    )
}