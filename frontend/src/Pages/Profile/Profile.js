import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import axios from "axios";
import Header from "../../components/Header";
import { currentUserAPI, logoutAPI, updateProfileAPI } from "../../utils/ApiRequest";
import { clearStoredAuth, getAuthHeaders, getStoredAuth, setStoredAuth } from "../../utils/auth";
import { fileToBase64, resolveAssetUrl } from "../../utils/files";
import { useNavigate } from "react-router-dom";
import "../Home/home.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredAuth()?.user || null);
  const [name, setName] = useState(getStoredAuth()?.user?.name || "");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(logoutAPI, {}, { headers: getAuthHeaders() });
    } catch (error) {
      // ignore stateless logout errors
    } finally {
      clearStoredAuth();
      navigate("/login");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await axios.get(currentUserAPI, { headers: getAuthHeaders() });
        setUser(data.user);
        setName(data.user.name || "");
        setStoredAuth({
          ...getStoredAuth(),
          user: data.user,
        });
      } catch (error) {
        clearStoredAuth();
        navigate("/login");
      }
    };

    loadProfile();
  }, [navigate]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFileName(file.name);
    const encodedFile = await fileToBase64(file);
    setImage(encodedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      setLoading(true);
      const { data } = await axios.patch(
        updateProfileAPI,
        {
          name,
          image,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      setUser(data.user);
      setStoredAuth({
        ...getStoredAuth(),
        user: data.user,
      });
      setMessage(data.message);
      setImage("");
      setSelectedFileName("");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header user={user} onLogout={handleLogout} />
      <Container className="mt-4 dashboardShell">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="p-4 bg-dark text-white border-0 shadow">
              <h2>Profile</h2>
              <p className="heroSubtext">Update your profile details and image.</p>

              {message ? <Alert variant="success">{message}</Alert> : null}
              {error ? <Alert variant="danger">{error}</Alert> : null}

              <div className="d-flex align-items-center gap-4 flex-wrap mb-4">
                {resolveAssetUrl(user?.avatarImage) ? (
                  <img
                    src={resolveAssetUrl(user?.avatarImage)}
                    alt={user?.name || "Profile"}
                    style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div className="profileAvatarFallback" style={{ width: 96, height: 96 }}>
                    {(user?.name || "F").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="mb-1">{user?.name}</h4>
                  <p className="mb-0 text-light">{user?.email}</p>
                </div>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control value={name} onChange={(event) => setName(event.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control value={user?.email || ""} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Profile Image</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                  {selectedFileName ? <Form.Text className="text-light">{selectedFileName}</Form.Text> : null}
                </Form.Group>

                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
