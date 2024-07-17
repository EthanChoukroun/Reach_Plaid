// Import the Twilio module
const twilio = require("twilio");
const User = require('./mongoDB/accessTokenSchema').User; // Adjust the import based on your schema export
const accountSid = process.env.TWILIO_ACCOUNTSID;
const authToken = process.env.TWILIO_AUTHTOKEN;

// Create a Twilio client
const client = new twilio(accountSid, authToken);

// The WhatsApp number you are sending the message from (Twilio number)
const from = "whatsapp:+14155238886";

// The WhatsApp number you are sending the message to
const to = "whatsapp:+18649792409";

// Define the budget
const smart_budget = 40;

// Function to send budget message
module.exports.sendBudgetMessage = async function(smartBudget, phone, userId) {
  const phoneTo = "whatsapp:" + phone;
  const messageContent = `You can spend $${smartBudget} over the next 24 hrs, be wise :)`;

  try {
    // Find the user by phone number
    const user = await User.findOne({ phone: phone });
    if (!user) {
      console.log(`User not found for phone number ${phone}`);
      return;
    }

    // Check if message has already been sent
    if (user.sentMessages) {
      console.log(`Message "${messageContent}" already sent to user ${userId}`);
    } else {
      await flow1(smartBudget, phone)
    }

    // Send WhatsApp message
    const response = await client.messages.create({
      from: from,
      to: phoneTo,
      body: messageContent,
    });

    console.log(`Message sent with SID: ${response.sid}`);

    // Update user's sentMessages status
    user.sentMessages = true;
    await user.save();
    console.log(`User ${userId} updated with sentMessages = true`);

  } catch (error) {
    console.error(`Error sending message: ${error}`);
    throw error;
  }
};

// Function to send a series of messages
async function flow1(smartBudget, phoneTo) {
  const message1 = "Hello";
  const message2 = `Welcome to Reach, here is your Plaid Link http://www.letsgetreach.com/?phone=8649792409`;
  const message3 = `Congratulation, you are all set!`;
  const message4 = `You can spend $${smartBudget} over the next 24 hrs, be wise :)`;
  phoneTo = 'whatsapp:+1' + phoneTo
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

    // Pause for a short duration to ensure the message is processed
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Send the fourth message
    const response4 = await client.messages.create({
      from: from,
      to: phoneTo,
      body: message4,
    });
    console.log(`Message 4 sent with SID: ${response4.sid}`);

    console.log("All messages sent successfully.");
  } catch (error) {
    console.error(`Failed to send messages: ${error}`);
  }
}

// Example usage
// flow1();
