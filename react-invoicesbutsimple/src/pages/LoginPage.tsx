import React, { useContext } from "react";
import Login from "../auth/Login";
import Authorized from "../auth/Authorized";
import { Button } from "../components";
import { logout } from "../auth/handleJWT";
import AuthenticationContext from "../auth/AuthenticationContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const {update, claims} = useContext(AuthenticationContext)
    const navigate = useNavigate();
    return (
        <>
            <h1>Войти</h1>
            <Authorized
                authorized={<>
                    <span className="nav-link">Вы уже зарегистрированы!</span>
                    <Button
                    onClick={() => {
                        logout();
                        update([]);
                        navigate('/')
                    }}
                    className="nav-link btn btn-danger"
                    >Выйти</Button>
                    <Button onClick={()=>(navigate('/'))}>Назад</Button>
                </>}
                notAuthorized={<>
                <div className="row justify-content-center">
                    <div className="col-5 ">
                        <Login></Login>
                    </div>
                </div>
                </>}
            />
        </>
    )
}
