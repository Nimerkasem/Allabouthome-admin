
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
export default function Home({ user }) {
  return (
  <>
    <h1>Welcome back {user.name}</h1>
    
    <Button variant="secondary" size="lg" active>
    <Link to="/Products">Manage Products</Link>
    </Button>
  </>



   
/*
    <div>
      <h1>Welcome back {use r.name}</h1>
      <Link to="/Products">Manage Products</Link>
    </div> */
  );
}
