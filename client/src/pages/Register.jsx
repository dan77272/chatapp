import { useContext, useState } from 'react'
import './Register.scss'
import axios from 'axios'
import { UserContext } from './UserContext'

export const Register = () => {

    const [login, setLogin] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [usernameExists, setUsernameExists] = useState('')
    const {setUsername:setLoggedInUser, setId} = useContext(UserContext)
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        const url = login ? '/register' : '/login'
        try{
            const {data} = await axios.post(url, {username, password})
            console.log(data.error)
            setLoggedInUser(username)
            setId(data.id)
        }
        catch(error){
            setUsernameExists(error.response.data.error)
        }

        
    }


    return (
        <div className="register">
            <h1>MY CHAT APP</h1>
            <div className="registerForm">
                <form className='form' onSubmit={handleSubmit}>
                    <input type='text' value={username} onChange={e => setUsername(e.target.value)} placeholder='Username'/>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder='Password'/>
                    
                    {login ? 
                    <div>
                        <button type='submit'>Register</button>
                        <p style={{color: 'red'}}>{usernameExists}</p>
                        <p>Already a user? <span onClick={() => setLogin(!login)}>Login</span></p>
                    </div>
                     : 
                     <div>
                        <button type='submit'>Login</button>
                        <p style={{color: 'red'}}>{usernameExists}</p>
                        <p>Not a user? <span onClick={() => setLogin(!login)}>Register</span></p>
                     </div>
                    }       
                     
                </form>
            </div>
        </div>
    )
}