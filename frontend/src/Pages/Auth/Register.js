import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import "./auth.css";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerAPI } from "../../utils/ApiRequest";
import axios from "axios";
import { getStoredAuth, setStoredAuth } from "../../utils/auth";
import { passwordRuleText, validateEmail, validatePassword } from "../../utils/validation";

const toastOptions = {
  position: "bottom-right",
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  theme: "dark",
};

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (getStoredAuth()?.token) {
      navigate("/");
    }
  }, [navigate]);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!values.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!validateEmail(values.email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!validatePassword(values.password)) {
      setError(passwordRuleText);
      return;
    }

    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(registerAPI, {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      setStoredAuth({
        token: data.token,
        user: data.user,
      });
      toast.success(data.message, toastOptions);
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-center">
                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: "white" }} />
              </h1>
              <h1 className="text-center text-white">Create your Finora account</h1>
              <p className="authSubtext">Use a strong password so your finance data stays safe.</p>
              {error ? <Alert variant="danger">{error}</Alert> : null}

              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formBasicName" className="mt-3">
                  <Form.Label className="text-white">Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={values.name}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group controlId="formBasicEmail" className="mt-3">
                  <Form.Label className="text-white">Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={values.email}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Label className="text-white">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={values.password}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-light authHint">{passwordRuleText}</Form.Text>
                </Form.Group>

                <Form.Group controlId="formBasicConfirmPassword" className="mt-3">
                  <Form.Label className="text-white">Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={values.confirmPassword}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="authActions mt-4">
                  <Link to="/forgot-password" className="text-white lnk">
                    Forgot Password?
                  </Link>

                  <Button type="submit" className="text-center mt-3 btnStyle" disabled={loading}>
                    {loading ? "Registering..." : "Sign Up"}
                  </Button>

                  <p className="mt-3 authMutedText">
                    Already have an account?{" "}
                    <Link to="/login" className="text-white lnk">
                      Login
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

export default Register;
