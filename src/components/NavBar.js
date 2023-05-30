import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiPlusCircle, FiFolder } from 'react-icons/fi';
// Styled Components
const StyledNav = styled.nav`
  background-color: #252525;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 10px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;

  img {
    width: 50px;
    height: 50px;
    margin-right: 10px;
  }

  .app-name {
    font-weight: 600;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;

  li {
    margin-right: 15px;
  }

  a {
    color: #ffffff;
    text-decoration: none;
    display: flex;
    align-items: center;

    .nav-icon {
      margin-right: 5px;
      color: #ffffff;
    }

    &:hover {
      color: #ffcc00;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    margin-top: 10px;

    li {
      margin-right: 0;
      margin-bottom: 10px;
    }
  }
`;

const NavBar = () => {
  return (
    <StyledNav>
      <Logo>
        {/* Replace 'logo.png' with the path to your logo image */}
        <img src="./logo.png" alt="Logo" />
        {/* Replace 'Your App Name' with your actual app name */}
        <span className="app-name">Flare Community Lazy Minting</span>
      </Logo>
      <NavLinks>
        <li>
          <Link to="/">
            <FiHome className="nav-icon" />
            Home
          </Link>
        </li>
        <li>
          <Link to="/mint">
            <FiPlusCircle className="nav-icon" />
            Mint
          </Link>
        </li>
        <li>
          <Link to="/batch-mint">
            <FiPlusCircle className="nav-icon" />
            Batch Mint
          </Link>
        </li>
        {/* <li>
          <Link to="/deploy-contract">
            <FiPlusCircle className="nav-icon" />
            Deploy Contract
          </Link>
        </li> */}
        <li>
          <Link to="/my-tokens">
            <FiFolder className="nav-icon" />
            My Tokens
          </Link>
        </li>
      </NavLinks>
    </StyledNav>
  );
};

export default NavBar;
