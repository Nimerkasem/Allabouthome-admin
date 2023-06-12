import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const NavBar = ({isLogedIn}) => {
    return (
    <Nav variant="tabs" defaultActiveKey="/login">
      {isLogedIn && (
        <>
          <Nav.Item>
        <Nav.Link href="/home">Home</Nav.Link>
      </Nav.Item>
        </>
      )}
    
      {!isLogedIn && (
        <>
         <Nav.Item>
         <Nav.Link href="/">Login</Nav.Link>
       </Nav.Item>
       <Nav.Item>
         <Nav.Link href="/register">Register</Nav.Link>
       </Nav.Item>
       </>
      )}
    </Nav>
    );
};

export default NavBar;
