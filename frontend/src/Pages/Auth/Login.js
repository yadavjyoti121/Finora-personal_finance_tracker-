import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { loginAPI } from "../../utils/ApiRequest";
import { getStoredAuth, setStoredAuth } from "../../utils/auth";
import { validateEmail } from "../../utils/validation";
import "./auth.css";

const toastOptions = {
  position: "bottom-right",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  theme: "dark",
};

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (getStoredAuth()?.token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(values.email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!values.password.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(loginAPI, values);

      setStoredAuth({
        token: data.token,
        user: data.user,
      });

      toast.success(data.message, toastOptions);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "#000",
            },
          },
          fpsLimit: 60,
          particles: {
            number: {
              value: 200,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: "#ffcc00",
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.5,
              random: true,
            },
            size: {
              value: 3,
              random: { enable: true, minimumValue: 1 },
            },
            links: {
              enable: false,
            },
            move: {
              enable: true,
              speed: 2,
            },
          },
          detectRetina: true,
        }}
        style={{
          position: "absolute",
          zIndex: -1,
          inset: 0,
        }}
      />
      <Container className="mt-5 authContainer">
        <Row>
          <Col md={{ span: 6, offset: 3 }}>
            <div className="authCard">
              <h1 className="text-center mt-2">
                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "white" }} />
              </h1>
              <h2 className="text-white text-center">Login to Finora</h2>
              <p className="authSubtext">Track spending, review trends, and stay in control.</p>

              {error ? <Alert variant="danger">{error}</Alert> : null}

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicEmail" className="mt-3">
                  <Form.Label className="text-white">Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    name="email"
                    onChange={handleChange}
                    value={values.email}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Label className="text-white">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    value={values.password}
                  />
                </Form.Group>

                <div className="authActions mt-4">
                  <Link to="/forgot-password" className="text-white lnk">
                    Forgot Password?
                  </Link>

                  <Button type="submit" className="text-center mt-3 btnStyle" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </Button>

                  <p className="mt-3 authMutedText">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-white lnk">
                      Register
                    </Link>
                  </p>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
        <ToastContainer />
      </Container>
    </div>
  );
};

export default Login;
