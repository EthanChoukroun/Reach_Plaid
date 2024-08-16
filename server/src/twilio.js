// Import the Twilio module
const twilio = require("twilio");
const User = require('./mongoDB/accessTokenSchema').User; // Adjust the import based on your schema export
const accountSid = process.env.TWILIO_ACCOUNTSID;
const authToken = process.env.TWILIO_AUTHTOKEN;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
// Create a Twilio client
const client = new twilio(accountSid, authToken);

// The WhatsApp number you are sending the message from (Twilio number)
const from = "whatsapp:+15075650337";

// The WhatsApp number you are sending the message to
const to = "whatsapp:+18649792409";

// Define the budget
const smart_budget = 40;

// Function to send budget message
const sendBudgetMessage = async function(smartBudget, phone) {
  const phoneTo = "whatsapp:" + phone;
  const messageContent = `You can spend $${smartBudget} over the next 24 hrs, be wise :)`;

  try {
    // Find the user by phone number
    const user = await User.findOne({ phone: phone });
    if (!user) {
      console.log(`User not found for phone number ${phone}`);
      return;
    }
    // Send WhatsApp message
    const response = await client.messages.create({
      from: from,
      to: phoneTo,
      body: messageContent,
    });

    console.log(`Message sent with SID: ${response.sid}`);

  } catch (error) {
    console.error(`Error sending message: ${error}`);
    throw error;
  }
};

// Function to send a series of messages
const flow1 = async function(phoneTo) {
  const message1 = "Hello";
  const phoneNumber = phoneTo.split(':')[1]; // Remove the 'whatsapp:' part
  const digits = phoneNumber.slice(-10); // Get the last nine characters
  const message2 = `Welcome to Reach, here is your Plaid Link ${BASE_URL}/?phone=${digits}`;
  const message3 = `Congratulation, you are all set!`;
  try {
    // Send the first message
    const response1 = await client.messages.create({
      from: from,
      to: phoneTo,
      body: message1,
    });
    console.log(`Message 1 sent with SID: ${response1.sid}`);

    // Pause for a short duration to ensure the message is processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Send the second message
    const response2 = await client.messages.create({
      from: from,
      to: phoneTo,
      body: message2,
    });
    console.log(`Message 2 sent with SID: ${response2.sid}`);

    // Pause for a short duration to ensure the message is processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Send the third message
    const response3 = await client.messages.create({
      from: from,
      to: phoneTo,
      body: message3,
    });
    console.log(`Message 3 sent with SID: ${response3.sid}`);

    console.log("All messages sent successfully.");
  } catch (error) {
    console.error(`Failed to send messages: ${error}`);
  }
}
module.exports = {flow1, sendBudgetMessage}