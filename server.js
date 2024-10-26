const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const JoinRequest = require('./models/JoinRequest');
const JoinNowRequest = require('./models/User');
const MediaItem = require('./models/MediaItem');
const ContactRequest = require('./models/ContactRequest');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve static files from uploads directory

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

// MongoDB connection
mongoose.connect('mongodb+srv://priti:Priti%4012$@jalgaonploggers.eckbz.mongodb.net/ngoDatabase?retryWrites=true&w=majority')
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

// API route to handle donation intention submission

const mailjet = require('node-mailjet').apiConnect('c56ed402c25fb54aec9a5849a2465220', 'cc1d79de63616048fbeef26b88376329');
app.post('/api/donate', async (req, res) => {
    const { fullName, email, phone } = req.body;

    try {
        const joinRequest = new JoinRequest({ fullName, email, phone });
        await joinRequest.save();

        
        // Create the PDF certificate
        const doc = new PDFDocument();
        let pdfBuffer = await new Promise((resolve, reject) => {
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            doc.rect(10, 10, 580, 780).lineWidth(10).stroke('green'); // Changed to green border
            
            doc.fontSize(32).text('Certificate of Acknowledgement', { align: 'center', underline: true }).moveDown(2);
            doc.fontSize(24).text('This certificate is proudly presented to', { align: 'center' }).moveDown(1)
                .fontSize(28).text(fullName, { align: 'center', underline: true }).moveDown(2);
            doc.fontSize(16).text('In appreciation of your interest and for taking the first step towards supporting Jalgaon Ploggers by completing our donation form.', { align: 'center' }).moveDown(3);
            doc.text('Nikhil Pendharkar (Co-Founder)', { align: 'center' })
                .moveDown(1).text('Chetna Jain (Founder)', { align: 'center' })
                .moveDown(1).text('Shubham Wani (Co-Founder)', { align: 'center' });
            doc.end();
        });

        // Send email using Mailjet
        const request = mailjet
            .post("send", { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: "ackjalgaonploggers@gmail.com",
                            Name: "Jalgaon Ploggers"
                        },
                        To: [
                            {
                                Email: email,
                                Name: fullName
                            }
                        ],
                        Subject: "Donation Certificate",
                        TextPart: `Hello ${fullName}, thank you for your contribution to Jalgaon Ploggers.`,
                        HTMLPart: `
                            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto;">
                                <h1 style="color: #4CAF50;">Thank You!</h1>
                                <p style="font-size: 18px;">This certificate is proudly presented to</p>
                                <h2 style="color: #333;">${fullName}</h2>
                                <p style="font-size: 16px;">for their outstanding contribution to</p>
                                <h3 style="color: #4CAF50;">Jalgaon Ploggers</h3>
                                <p style="font-size: 14px; color: #777;">Your efforts in promoting sustainable living and environmental awareness are greatly appreciated.</p>
                                <p style="font-size: 14px; color: #777;">Date: ${new Date().toLocaleDateString()}</p>
                            </div>
                        `,
                        Attachments: [
                            {
                                "ContentType": "application/pdf",
                                "Filename": "certificate.pdf",
                                "Base64Content": pdfBuffer.toString('base64')  // Attach the certificate PDF
                            }
                        ]
                    }
                ]
            });

        request
            .then((result) => {
                console.log("Message sent: %s", result.body.Messages[0].To[0].MessageID); // Log only the MessageID
                res.status(200).json({ message: 'Donation request saved and email sent', messageId: result.body.Messages[0].To[0].MessageID });
            })
            .catch((error) => {
                console.error('Error sending email:', error.message);  // Log the error message
                res.status(500).json({ message: 'Error sending email', error: error.message });
            });
    } catch (error) {
        console.error('Error processing donation request:', error);
        res.status(500).json({ message: 'Error saving donation request', error: error.message });
    }
});

// New API route to handle join requests
app.post('/api/join', async (req, res) => {
    const { fullName, dob, occupation } = req.body;

    try {
        const joinNowRequest = new JoinNowRequest({ fullName, dob, occupation });
        await joinNowRequest.save();
        res.status(200).json({ message: 'Join request submitted successfully' });
    } catch (error) {
        console.error('Error processing join request:', error);
        res.status(500).json({ message: 'Error saving join request', error: error.message });
    }
});

// New API route to handle media item submission
app.post('/api/media', upload.single('image'), async (req, res) => {
    const { googleFormLink } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const image = `/uploads/${req.file.filename}`; // Update to serve the correct path

    try {
        const mediaItem = new MediaItem({ image, googleFormLink });
        await mediaItem.save();
        res.status(200).json({ message: 'Media item submitted successfully', mediaItem });
    } catch (error) {
        console.error('Error processing media item:', error);
        res.status(500).json({ message: 'Error saving media item', error: error.message });
    }
});

// New API route to handle contact requests
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const contactRequest = new ContactRequest({ name, email, message });
        await contactRequest.save();
        res.status(200).json({ message: 'Contact request submitted successfully' });
    } catch (error) {
        console.error('Error processing contact request:', error);
        res.status(500).json({ message: 'Error saving contact request', error: error.message });
    }
});

// New route to fetch media items
app.get('/api/media', async (req, res) => {
    try {
        const mediaItems = await MediaItem.find();
        res.status(200).json(mediaItems);
    } catch (error) {
        console.error('Error fetching media items:', error);
        res.status(500).json({ message: 'Error fetching media items', error: error.message });
    }
});

// Start the server on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});