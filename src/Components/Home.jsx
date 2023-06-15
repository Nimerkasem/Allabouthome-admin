
import { Link } from 'react-router-dom';
import '../Css/Home.css'; 
import Button from 'react-bootstrap/Button';
import { Image } from 'react-bootstrap';
import userimg from '../assets/userimg.png';


export default function Home({user}) {
  return (
  <>
  <div className='home'>
    
    <div className='sidebar' >
    <h1>{user.name}</h1>

      <Image src={userimg} className='user' alt="user" />
      
      <div className="button-containerh">
        <Button style={{background:"white"}} variant="primary" size="lg" active>
          <Link to="/Products">Manage Products</Link>
        </Button>
        <Button style={{background:"white"}} variant="primary" size="lg" active>
          <Link to="/">SignOut</Link>
        </Button>
      </div>
      

    </div>

    <div className='bgdiv'>
      
      <h1>Welcome back {user.name}</h1>

    </div>

    </div>
  </>   
  );
}
