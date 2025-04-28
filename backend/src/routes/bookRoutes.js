import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import Book from '../models/Book.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// creating a Book
router.post('/', protectRoute,  async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        // checking if all fields are filled
        if (!title || !caption || !rating || !image) {
            return res.status(400).json({ message: 'Please fill all fields' });
        } 

        // upload the image to cloudinary 
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        // save the book to the database
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        });

        await newBook.save();

        res.status(201).json(newBook);
    } catch (error) {
        console.log("Error creating book", error);
        res.status(500).json({ message: error.message });
    }
});

// getting all books for the frontend
router.get('/', protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1; // get the page number from the query string
        const limit = 10; // number of books to show per page
        const skip = (page - 1) * limit; // calculate the number of books to skip

        const books = await Book.find()
        .sort({ createdAt: -1 }) // sort by newest first
        .skip(skip) // skip the books for the current page
        .limit(limit) // limit the number of books to show
        .populate('user', 'username profileImage') // populate the user field with name and email

        const totalBooks = await Book.countDocuments(); // get the total number of books
        res.send({
            books,
            currentPage: page,
            totalBooks: total,
            totalPages: Math.ceil(totalBooks / limit), // calculate the total number of pages
        });
    } catch (error) {
        console.log("Error getting books", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//get recommended books by the logged in user
router.get('/user', protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.log("Error getting user books", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

// deleting a book 
router.delete('/:id', protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // check if the user is the owner of the book
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // delete the image from cloudinary
        if (book.image && book.image.includes('cloudinary')) {
            try {
                const publicId = book.image.split('/').pop().split('.')[0]; // get the public id of the image
                cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.log("Error deleting image from cloudinary", error);
            }
        }

        await book.deleteOne();

        res.json({ message: 'Book removed successfully' });
    } catch (error) {
        console.log("Error deleting book", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;