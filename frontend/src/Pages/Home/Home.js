import React, { useCallback, useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Form, Container } from "react-bootstrap";
import "./home.css";
import {
  addTransaction,
  currentUserAPI,
  getTransactions,
  logoutAPI,
} from "../../utils/ApiRequest";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Spinner from "../../components/Spinner";
import TableData from "./TableData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BarChartIcon from "@mui/icons-material/BarChart";
import Analytics from "./Analytics";
import ChatbotWidget from "../../components/ChatbotWidget";
import {
  clearStoredAuth,
  getAuthHeaders,
  getStoredAuth,
  setStoredAuth,
} from "../../utils/auth";

const initialFormValues = {
  title: "",
  amount: "",
  description: "",
  category: "",
  date: "",
  transactionType: "",
};

const toastOptions = {
  position: "bottom-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

const Home = () => {
  const navigate = useNavigate();

  const [cUser, setcUser] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [frequency, setFrequency] = useState("7");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [view, setView] = useState("table");
  const [values, setValues] = useState(initialFormValues);

  const handleStartChange = (date) => setStartDate(date);
  const handleEndChange = (date) => setEndDate(date);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const triggerRefresh = () => setRefreshKey((current) => current + 1);

  const handleAuthFailure = useCallback(() => {
    clearStoredAuth();
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const auth = getStoredAuth();

        if (!auth?.token) {
          navigate("/login");
          return;
        }

        const { data } = await axios.get(currentUserAPI, {
          headers: getAuthHeaders(),
        });

        setStoredAuth({
          ...auth,
          user: data.user,
        });
        setcUser(data.user);
      } catch (error) {
        handleAuthFailure();
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [handleAuthFailure, navigate]);

  useEffect(() => {
    const fetchAllTransactions = async () => {
      if (!cUser) {
        return;
      }

      try {
        setLoading(true);
        const { data } = await axios.post(
          getTransactions,
          {
            frequency,
            startDate,
            endDate,
            type,
          },
          {
            headers: getAuthHeaders(),
          }
        );

        setTransactions(data.transactions);
      } catch (error) {
        toast.error("Unable to load transactions. Please log in again.", toastOptions);
        handleAuthFailure();
      } finally {
        setLoading(false);
      }
    };

    fetchAllTransactions();
  }, [cUser, frequency, endDate, startDate, type, refreshKey, handleAuthFailure]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, amount, description, category, date, transactionType } = values;

    if (!title || !amount || !description || !category || !date || !transactionType) {
      toast.error("Please enter all the fields", toastOptions);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        addTransaction,
        {
          title,
          amount,
          description,
          category,
          date,
          transactionType,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      if (data.success === true) {
        toast.success(data.message, toastOptions);
        handleClose();
        setValues(initialFormValues);
        triggerRefresh();
      } else {
        toast.error(data.message, toastOptions);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add transaction", toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setType("all");
    setStartDate(null);
    setEndDate(null);
    setFrequency("7");
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        logoutAPI,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
    } catch (error) {
      // The client state should still be cleared even if the stateless endpoint fails.
    } finally {
      clearStoredAuth();
      navigate("/login");
    }
  };

  return (
    <>
      <Header user={cUser} onLogout={handleLogout} />

      {loading ? (
        <Spinner />
      ) : (
        <>
          <Container className="mt-3 dashboardShell">
            <div className="dashboardHero">
              <div>
                <p className="heroEyebrow">Personal Expense Tracker</p>
                <h1>Welcome back{cUser?.name ? `, ${cUser.name}` : ""}</h1>
                <p className="heroSubtext">
                  Track your spending, review trends, and use the assistant for quick answers.
                </p>
              </div>
            </div>

            <div className="filterRow">
              <div className="text-white">
                <Form.Group className="mb-3" controlId="formSelectFrequency">
                  <Form.Label>Select Frequency</Form.Label>
                  <Form.Select name="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                    <option value="7">Last Week</option>
                    <option value="30">Last Month</option>
                    <option value="365">Last Year</option>
                    <option value="custom">Custom</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="text-white type">
                <Form.Group className="mb-3" controlId="formSelectType">
                  <Form.Label>Type</Form.Label>
                  <Form.Select name="type" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="all">All</option>
                    <option value="expense">Expense</option>
                    <option value="credit">Earned</option>
                  </Form.Select>
                </Form.Group>
              </div>

              <div className="text-white iconBtnBox">
                <FormatListBulletedIcon
                  sx={{ cursor: "pointer" }}
                  onClick={() => setView("table")}
                  className={`${view === "table" ? "iconActive" : "iconDeactive"}`}
                />
                <BarChartIcon
                  sx={{ cursor: "pointer" }}
                  onClick={() => setView("chart")}
                  className={`${view === "chart" ? "iconActive" : "iconDeactive"}`}
                />
              </div>

              <div>
                <Button onClick={handleShow} className="addNew">
                  Add New
                </Button>
                <Button onClick={handleShow} className="mobileBtn">
                  +
                </Button>
                <Modal show={show} onHide={handleClose} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Add Transaction Details</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form>
                      <Form.Group className="mb-3" controlId="formName">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          name="title"
                          type="text"
                          placeholder="Enter transaction title"
                          value={values.title}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formAmount">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control
                          name="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={values.amount}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formSelect">
                        <Form.Label>Category</Form.Label>
                        <Form.Select name="category" value={values.category} onChange={handleChange}>
                          <option value="">Choose...</option>
                          <option value="Groceries">Groceries</option>
                          <option value="Rent">Rent</option>
                          <option value="Salary">Salary</option>
                          <option value="Tip">Tip</option>
                          <option value="Food">Food</option>
                          <option value="Medical">Medical</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                          type="text"
                          name="description"
                          placeholder="Enter description"
                          value={values.description}
                          onChange={handleChange}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formSelect1">
                        <Form.Label>Transaction Type</Form.Label>
                        <Form.Select
                          name="transactionType"
                          value={values.transactionType}
                          onChange={handleChange}
                        >
                          <option value="">Choose...</option>
                          <option value="credit">Credit</option>
                          <option value="expense">Expense</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formDate">
                        <Form.Label>Date</Form.Label>
                        <Form.Control type="date" name="date" value={values.date} onChange={handleChange} />
                      </Form.Group>
                    </Form>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={handleSubmit}>
                      Submit
                    </Button>
                  </Modal.Footer>
                </Modal>
              </div>
            </div>

            {frequency === "custom" ? (
              <div className="date">
                <div className="form-group">
                  <label htmlFor="startDate" className="text-white">
                    Start Date:
                  </label>
                  <div>
                    <DatePicker
                      selected={startDate}
                      onChange={handleStartChange}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="endDate" className="text-white">
                    End Date:
                  </label>
                  <div>
                    <DatePicker
                      selected={endDate}
                      onChange={handleEndChange}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="containerBtn">
              <Button variant="primary" onClick={handleReset}>
                Reset Filter
              </Button>
            </div>

            {view === "table" ? (
              <TableData data={transactions} user={cUser} onRefresh={triggerRefresh} />
            ) : (
              <Analytics transactions={transactions} user={cUser} />
            )}
            <ToastContainer />
          </Container>

          <ChatbotWidget />
        </>
      )}
    </>
  );
};

export default Home;
