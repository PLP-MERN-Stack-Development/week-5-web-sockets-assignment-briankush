import { createContext, useEffect, useReducer } from "react";
import axios from "axios";

export const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return { ...state, loading: true };
    case "LOGIN_SUCCESS":
      return { ...state, user: action.payload, loading: false, error: null };
    case "LOGIN_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Check if user is already logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } else {
      dispatch({ type: "LOGIN_SUCCESS", payload: null });
    }
  }, []);

  // Register user
  const register = async (username, password) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password,
      });
      localStorage.setItem("user", JSON.stringify(data));
      dispatch({ type: "LOGIN_SUCCESS", payload: data });
    } catch (error) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: error.response?.data?.message || "Registration failed",
      });
    }
  };

  // Login user
  const login = async (username, password) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });
      localStorage.setItem("user", JSON.stringify(data));
      dispatch({ type: "LOGIN_SUCCESS", payload: data });
    } catch (error) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: error.response?.data?.message || "Login failed",
      });
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
