import { processChatbotQuery } from "../services/chatbotService.js";

export const chatbotQueryController = async (req, res) => {
  try {
    const { message } = req.body;

    const response = await processChatbotQuery({
      userId: req.user.id,
      message,
    });

    const statusCode = response.success === false ? 400 : 200;
    return res.status(statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      intent: "error",
      answer: "Something went wrong while processing your request.",
      message: error.message,
    });
  }
};
