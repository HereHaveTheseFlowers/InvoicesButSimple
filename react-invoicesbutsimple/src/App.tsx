import { Router } from './router';
import './App.css';
import AuthenticationContext from './auth/AuthenticationContext';
import { useEffect, useState } from 'react';
import { claim } from './auth/auth.models';
import { getClaims, logout } from './auth/handleJWT';
import configureInterceptor from './auth/httpInterceptors';
import iconImg from './assets/icon.jpg';
import { Button } from './components';
import { Link, useNavigate } from 'react-router-dom';
import Authorized from './auth/Authorized';

configureInterceptor();
 
export default function App() {

  const [claims, setClaims] = useState<claim[]>([
  ])
    

  useEffect(() => {
    setClaims(getClaims())
  }, [])
  
  const navigate = useNavigate();

  const handleGoHome = () => {
      if(window.location.pathname === '/') {
          window.location.reload();
      } else {
        navigate('/');
      }
  };

  return (
      <main className="main">
        <a className="main__logo" onClick={handleGoHome}><img src={iconImg}></img></a>
        <div className="container app__container">
          <div className="app__circles">
              <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
              <span className="tablet__hide"></span>
              <span className="tablet__hide"></span>
              <span className="tablet__hide"></span>
              <span className="tablet__hide"></span>
              <span className="tablet__hide"></span>
              <span className="tablet__hide"></span>
              <span className="tablet__hide"></span>
              <span className="tablet__hide"></span>
              <span className="tablet__hide"></span>
          </div>
          <AuthenticationContext.Provider value={{claims, update: setClaims}}>
            
            <Authorized
                authorized={<>
                    <Button
                        onClick={() => {
                            logout();
                            setClaims([]);
                        }}
                        className="btn btn-danger app__logout"
                        >Выйти</Button>
                </>}
                notAuthorized={<>
                  <Button
                      onClick={()=>(navigate('/register'))}
                      className="btn btn-warning app__logout"
                      >Зарегистрироваться</Button>
                  <Button
                      onClick={()=>(navigate('/login'))}
                      className="btn btn-primary app__login"
                      >Войти</Button>
                </>}
            />
            <Router />
          </AuthenticationContext.Provider>
        </div>
      </main>
  );
}
