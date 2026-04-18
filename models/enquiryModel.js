const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
{
listingId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Listing",
required: true
},

explorerId: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true
},

message: {
type: String,
required: true
}
},
{ timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
