import React, { useState, useContext } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tab,
  Tabs,
  Alert,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, register, error, loading } = useContext(AuthContext);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tab === 0) {
      await login(username, password);
    } else {
      await register(username, password);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography variant="h4" align="center" gutterBottom>
            Chat Application
          </Typography>
          
          <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? "Processing..." : tab === 0 ? "Login" : "Register"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
