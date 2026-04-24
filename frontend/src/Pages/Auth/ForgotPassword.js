import { useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { forgotPasswordAPI } from "../../utils/ApiRequest";
import { validateEmail } from "../../utils/validation";
import "./auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setPreviewUrl("");

    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(forgotPasswordAPI, { email });
      setMessage(data.message);
      setPreviewUrl(data.previewUrl || "");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to start password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="authPlainPage">
      <Row className="justify-content-center w-100">
        <Col md={6} lg={5}>
          <div className="authCard authFeatureCard">
            <div className="authBadge">Password Recovery</div>
            <h2 className="text-white text-center">Forgot Password</h2>
            <p className="authSubtext">We'll send you a secure reset link that expires in 15 minutes.</p>

            {error ? <Alert variant="danger">{error}</Alert> : null}
            {message ? <Alert variant="success">{message}</Alert> : null}
            {previewUrl ? (
              <Alert variant="warning" className="authAlertLink">
                SMTP is not configured yet. Use this development reset link:
                <div>
                  <a href={previewUrl} target="_blank" rel="noreferrer">
                    {previewUrl}
                  </a>
                </div>
              </Alert>
            ) : null}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mt-3">
                <Form.Label className="text-white">Email address</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your registered email"
                />
              </Form.Group>

              <div className="authActions mt-4">
                <Button type="submit" className="btnStyle authPrimaryButton" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                <p className="mt-3 authMutedText">
                  Remembered your password?{" "}
                  <Link to="/login" className="text-white lnk">
                    Back to Login
                  </Link>
                </p>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
