import { useSelector } from "react-redux";
import EditProfle from "./EditProfile";


const Profile = () => {
    const user = useSelector((store) => store.user);
    return ( 
        user && (
        <div>
            <EditProfle user={user}/>
        </div>
        )
    );
};
export default Profile;