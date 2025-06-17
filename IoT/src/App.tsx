import './App.css'
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import { isExpired } from "react-jwt";
import Navbar from './components/Navbar'
import DevicesList from './components/DeviceList'
import LoginForm from './components/Login';
import SignUpForm from './components/SignUpForm';
import DeleteFromRange from './components/DeleteFromRange';
import ChartFromLastHour from './components/ChartFromLastHour';
import Profile from './components/Profile';

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <Navbar /> }></Route>
        <Route path='login' element={ <LoginForm /> }></Route>
        <Route path='register' element={ <SignUpForm /> }></Route>
        <Route path="devices-list" element={ isExpired(localStorage.getItem('token') ?? "") ? <Navigate replace to="/"/> : <DevicesList/> }/>
        <Route path='delete-from-range' element={ isExpired(localStorage.getItem('token') ?? "") ? <Navigate replace to="/"/> : <DeleteFromRange /> } />
        <Route path='latest' element={ isExpired(localStorage.getItem('token') ?? "") ? <Navigate replace to="/"/> : <ChartFromLastHour /> } />
        <Route path='profile' element={ isExpired(localStorage.getItem('token') ?? "") ? <Navigate replace to="/"/> : <Profile /> } />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
