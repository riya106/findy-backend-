const Enquiry = require("../models/enquiryModel");

const saveEnquiry = async (req, res) => {
  try {

    const { listingId, explorerId, message } = req.body;

    const enquiry = new Enquiry({
      listingId,
      explorerId,
      message
    });

    await enquiry.save();

    res.send({
      status: 1,
      message: "Enquiry saved successfully"
    });

  } catch (error) {

    console.log(error);

    res.send({
      status: 0,
      message: "Error saving enquiry"
    });
  }
};

module.exports = { saveEnquiry };