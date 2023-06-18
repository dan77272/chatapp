import './App.css';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import { Register } from './pages/Register';
import axios from 'axios'
import {UserContext, UserContextProvider } from './pages/UserContext';
import { Routes } from './pages/Routes';



function App() {

  axios.defaults.baseURL = 'http://localhost:3001'
  axios.defaults.withCredentials = true

  const Layout = () => {
    return (
      <div>
        <UserContextProvider>
          <Outlet/>
        </UserContextProvider>
      </div>
    )
    
  }
  
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout/>,
      children: [
        {
          path: '/',
          element: <Routes/>
        }
      ]
    }
  ])

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
