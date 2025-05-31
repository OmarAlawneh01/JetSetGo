import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  FlightTakeoff as FlightIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { logout } from '../store/slices/authSlice';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(function(state) {
    return state.auth;
  });
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleMenu(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleLogout() {
    dispatch(logout());
    handleClose();
    navigate('/login');
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Toolbar>
        <FlightIcon sx={{ color: '#1E90FF', mr: 1 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: '#1E90FF',
            fontWeight: 'bold',
          }}
        >
          JetSetGo
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/destinations"
            sx={{ color: '#1E90FF' }}
          >
            Destinations
          </Button>
          <Button
            component={RouterLink}
            to="/contact"
            sx={{ color: '#1E90FF' }}
          >
            Contact
          </Button>
          <Button
            component={RouterLink}
            to="/about"
            sx={{ color: '#1E90FF' }}
          >
            About
          </Button>
          
          {isAuthenticated ? (
            <>
              <IconButton
                onClick={handleMenu}
                sx={{ color: '#1E90FF' }}
              >
                {user?.avatar ? (
                  <Avatar src={user.avatar} alt={user.name} />
                ) : (
                  <AccountIcon />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  component={RouterLink}
                  to="/profile"
                  onClick={handleClose}
                >
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                sx={{ color: '#1E90FF' }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                sx={{
                  backgroundColor: '#1E90FF',
                  '&:hover': {
                    backgroundColor: '#1976d2',
                  },
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 