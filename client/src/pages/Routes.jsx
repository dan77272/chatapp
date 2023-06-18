import { useContext } from "react"
import { UserContext } from "./UserContext"
import { Register } from "./Register"
import { Chat } from "./Chat"

export const Routes = () => {

    const {username, id} = useContext(UserContext)
    if(username){
        return <Chat/>
    }
    return (
        <Register/>
    )
}