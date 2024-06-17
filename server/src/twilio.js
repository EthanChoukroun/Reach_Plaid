// Import the Twilio module
const twilio = require("twilio");

let accountSid = "";
let authToken = "";
// Create a Twilio client
const client = new twilio(accountSid, authToken);

// The WhatsApp number you are sending the message from (Twilio number)
const from = "whatsapp:+14155238886";

// The WhatsApp number you are sending the message to
// const to = 'whatsapp:+33617300212';
const to = "whatsapp:+918104674440";

// The message you want to send
const message = "Hi, welcome to Reach !!";

// Send the message
// client.messages.create({
//   from: from,
//   to: to,
//   body: message
// })
// .then((message) => console.log(`Message sent with SID: ${message.sid}`))
// .catch((error) => console.error(`Failed to send message: ${error}`));

const smart_budget = 40;

module.exports.sendBudgetMessage = async function (smartBudget, phone) {
  let phoneTo = "whatsapp:" + phone;
  console.log(phone, phoneTo);
  const message4 = `You can spend $${smartBudget} over the next 24 hrs, be wise :)`;
  try {
    // Send the first message
    const response1 = await client.messages.create({
      from: from,
      to: phoneTo,
      body: message4,
    });
    console.log(`Message 1 sent with SID: ${response1.sid}`);
  } catch (error) {
    console.error(`Failed to send messages: ${error}`);
  }
};

async function flow1() {
  const message1 = "Hello";
  const message2 = `Welcome to Reach, here is your Plaid Link http://www.letsgetreach.com/?`;
  const message3 = `Congratulation, you are all set!`;
  const message4 = `You can spend $${smart_budget} over the next 24 hrs, be wise :)`;

  try {
    // Send the first message
    const response1 = await client.messages.create({
      from: from,
      to: to,
      body: message2,
    });
    console.log(`Message 1 sent with SID: ${response1.sid}`);

    // Pause for a short duration to ensure the message is processed
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // Send the second message
    // const response2 = await client.messages.create({
    //   from: from,
    //   to: to,
    //   body: message2,
    // });
    // console.log(`Message 2 sent with SID: ${response2.sid}`);

    // // Pause for a short duration to ensure the message is processed
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // // Send the third message
    // const response3 = await client.messages.create({
    //   from: from,
    //   to: to,
    //   body: message3,
    // });
    // console.log(`Message 3 sent with SID: ${response3.sid}`);

    // // Pause for a short duration to ensure the message is processed
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    // // Send the fourth message
    // const response4 = await client.messages.create({
    //   from: from,
    //   to: to,
    //   body: message4,
    // });
    // console.log(`Message 4 sent with SID: ${response4.sid}`);

    console.log("All messages sent successfully.");
  } catch (error) {
    console.error(`Failed to send messages: ${error}`);
  }
}

// Example usage
// flow1();
