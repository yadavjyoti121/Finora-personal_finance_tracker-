import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { resetPasswordAPI, validateResetTokenAPI } from "../../utils/ApiRequest";
import { passwordRuleText, validatePassword } from "../../utils/validation";
import "./auth.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [values, setValues] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenMeta, setTokenMeta] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const { data } = await axios.get(`${validateResetTokenAPI}/${token}/validate`);
        setIsTokenValid(true);
        setTokenMeta(data);
      } catch (error) {
        setError(error.response?.data?.message || "This reset link is invalid or has expired.");
        setIsTokenValid(false);
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

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
      const { data } = await axios.post(`${resetPasswordAPI}/${token}`, {
        password: values.password,
      });
      setMessage(data.message);
      setTimeout(() => navigate("/login"), 1600);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="authPlainPage">
      <Row className="justify-content-center w-100">
        <Col md={6} lg={5}>
          <div className="authCard authFeatureCard">
            <div className="authBadge">Secure Reset</div>
            <h2 className="text-white text-center">Reset Password</h2>
            <p className="authSubtext">Choose a new password for your Finora account.</p>

            {validatingToken ? (
              <div className="authLoadingBlock">
                <Spinner animation="border" />
                <span>Validating your reset link...</span>
              </div>
            ) : (
              <>
                {tokenMeta?.email ? (
                  <Alert variant="info">Resetting password for {tokenMeta.email}</Alert>
                ) : null}
                {error ? <Alert variant="danger">{error}</Alert> : null}
                {message ? <Alert variant="success">{message}</Alert> : null}

                {isTokenValid ? (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mt-3">
                      <Form.Label className="text-white">New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={values.password}
                        onChange={(event) => setValues({ ...values, password: event.target.value })}
                        placeholder="Enter a strong password"
                      />
                      <Form.Text className="text-light authHint">{passwordRuleText}</Form.Text>
                    </Form.Group>

                    <Form.Group className="mt-3">
                      <Form.Label className="text-white">Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={values.confirmPassword}
                        onChange={(event) => setValues({ ...values, confirmPassword: event.target.value })}
                        placeholder="Confirm your password"
                      />
                    </Form.Group>

                    <div className="authActions mt-4">
                      <Button type="submit" className="btnStyle authPrimaryButton" disabled={loading}>
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Updating...
                          </>
                        ) : (
                          "Reset Password"
                        )}
                      </Button>
                      <p className="mt-3 authMutedText">
                        Back to{" "}
                        <Link to="/login" className="text-white lnk">
                          Login
                        </Link>
                      </p>
                    </div>
                  </Form>
                ) : (
                  <div className="authActions mt-4">
                    <Link to="/forgot-password" className="text-white lnk">
                      Request a new reset link
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;
