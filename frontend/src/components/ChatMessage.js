import React from "react";

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`chatMessage ${isUser ? "userMessage" : "botMessage"}`}>
      <div className="chatBubble">
        <p className="chatText">{message.text}</p>

        {!isUser && message.data?.total !== undefined ? (
          <div className="chatSummaryCard">
            <span className="chatSummaryLabel">Total</span>
            <strong>{message.data.total}</strong>
            {message.data.category ? <span>{message.data.category}</span> : null}
            {message.data.periodLabel ? <span>{message.data.periodLabel}</span> : null}
          </div>
        ) : null}

        {!isUser && message.data?.transactions?.length ? (
          <div className="chatTransactionList">
            {message.data.transactions.slice(0, 4).map((transaction) => (
              <div key={transaction._id} className="chatTransactionRow">
                <span>{transaction.title}</span>
                <strong>{transaction.amount}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatMessage;
