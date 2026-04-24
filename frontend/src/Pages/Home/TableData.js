import React, { useEffect, useState } from "react";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import moment from "moment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import "./home.css";
import { deleteTransactions, editTransactions } from "../../utils/ApiRequest";
import axios from "axios";
import { getAuthHeaders } from "../../utils/auth";

const initialValues = {
  title: "",
  amount: "",
  description: "",
  category: "",
  date: "",
  transactionType: "",
};

const TableData = ({ data, onRefresh }) => {
  const [show, setShow] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [values, setValues] = useState(initialValues);

  const handleClose = () => {
    setShow(false);
    setEditingTransaction(null);
    setValues(initialValues);
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setValues({
      title: transaction.title,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      date: moment(transaction.date).format("YYYY-MM-DD"),
      transactionType: transaction.transactionType,
    });
    setShow(true);
  };

  const handleEditSubmit = async () => {
    if (!editingTransaction) {
      return;
    }

    await axios.put(`${editTransactions}/${editingTransaction._id}`, values, {
      headers: getAuthHeaders(),
    });

    handleClose();
    onRefresh?.();
  };

  const handleDeleteClick = async (transactionId) => {
    await axios.post(
      `${deleteTransactions}/${transactionId}`,
      {},
      {
        headers: getAuthHeaders(),
      }
    );

    onRefresh?.();
  };

  useEffect(() => {
    if (!show) {
      setValues(initialValues);
    }
  }, [show]);

  return (
    <>
      <Container>
        <Table responsive="md" className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {data.map((item) => (
              <tr key={item._id}>
                <td>{moment(item.date).format("YYYY-MM-DD")}</td>
                <td>{item.title}</td>
                <td>{item.amount}</td>
                <td>{item.transactionType}</td>
                <td>{item.category}</td>
                <td>
                  <div className="icons-handle">
                    <EditNoteIcon sx={{ cursor: "pointer" }} onClick={() => handleEditClick(item)} />
                    <DeleteForeverIcon
                      sx={{ color: "red", cursor: "pointer" }}
                      onClick={() => handleDeleteClick(item._id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Transaction Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="editTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                name="title"
                type="text"
                value={values.title}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                name="amount"
                type="number"
                value={values.amount}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editCategory">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={values.category}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
              >
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

            <Form.Group className="mb-3" controlId="editDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={values.description}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editTransactionType">
              <Form.Label>Transaction Type</Form.Label>
              <Form.Select
                name="transactionType"
                value={values.transactionType}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
              >
                <option value="credit">Credit</option>
                <option value="expense">Expense</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="editDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={values.date}
                onChange={(e) => setValues({ ...values, [e.target.name]: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TableData;
