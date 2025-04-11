const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { default: axios } = require("axios");

const app = express();
const PORT = 5000;

// File Paths
const interviewResultsFilePath = path.join(__dirname, "utils/interviews.json");
const productsFilePath = path.join(__dirname, "utils/products.json");
const usersFilePath = path.join(__dirname, "utils/users.json");
const reviewsFilePath = path.join(__dirname, "utils/reviews.json");

app.use(express.json());
app.use(cors());

// ========== Helper Functions ==========
const readJSON = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error(`Error reading file: ${filePath}`, error);
        return [];
    }
};

const writeJSON = (filePath, data) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8", (err) => {
        if (err) console.error(`Error writing to file: ${filePath}`, err);
    });
};

// ========== USERS ==========
// Login API
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const users = readJSON(usersFilePath);
    const user = users.find((u) => u.email === email && u.password === password);
   
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    // console.log(user, "all")
    res.json({ message: "Login successful", role: user.role, userId: user.id, username: user.name, userEmail: user.email });
});
app.get("/interviews", (req, res) => {
    const interviews = readJSON(interviewResultsFilePath);
    res.json(interviews);
});
app.post("/interviews", (req, res) => {
    const { candidateName, interviewScore, status } = req.body;
    if (!candidateName || !interviewScore || !status) {
        return res.status(400).json({ error: "All fields are required (candidateName, interviewScore, status)" });
    }

    let interviews = readJSON(interviewResultsFilePath);
    const newInterview = {
        id: interviews.length + 1, 
        candidateName, 
        interviewScore, 
        status
    };

    interviews.push(newInterview);
    writeJSON(interviewResultsFilePath, interviews);

    res.json({ message: "Interview result added successfully", interview: newInterview });
})

// ========== PRODUCTS ==========
// Get All Products
app.get("/products", (req, res) => res.json(readJSON(productsFilePath)));

// Get Single Product
app.get("/product/:id", (req, res) => {
    const products = readJSON(productsFilePath);
    const product = products.find((p) => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
});
// Get User Profile & Reviews
app.get("/user/:id", (req, res) => {
    const userId = parseInt(req.params.id);
    const users = readJSON(usersFilePath);
    const reviews = readJSON(reviewsFilePath);

    const user = users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch reviews written by the user
    const userReviews = reviews.filter((r) => r.userId === userId);

    res.json({ user, reviews: userReviews });
});
app.get("/users", (req, res) => {
    const userId = parseInt(req.params.id);
    const users = readJSON(usersFilePath);
    // const reviews = readJSON(reviewsFilePath);

    res.json({ users });
});
app.get("/reviews/:id", (req, res) => {
    const userId = parseInt(req.params.id);
    const users = readJSON(usersFilePath);
    const reviews = readJSON(reviewsFilePath);

    const user = users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch reviews written by the user
    const userReviews = reviews.filter((r) => r.userId === userId);

    res.json({ user, reviews: userReviews });
});

// Add New Product
app.post("/products", (req, res) => {
    let products = readJSON(productsFilePath);
    const newProduct = { id: products.length + 1, ...req.body, reviews: [] };

    products.push(newProduct);
    writeJSON(productsFilePath, products);

    res.json({ message: "Product added successfully", product: newProduct });
});

// Update Product
app.put("/products/:id", (req, res) => {
    let products = readJSON(productsFilePath);
    const index = products.findIndex((p) => p.id === parseInt(req.params.id));

    if (index === -1) return res.status(404).json({ error: "Product not found" });

    products[index] = { ...products[index], ...req.body };
    writeJSON(productsFilePath, products);

    res.json({ message: "Product updated successfully", product: products[index] });
});

// Delete Product
app.delete("/products/:id", (req, res) => {
    let products = readJSON(productsFilePath);
    products = products.filter((p) => p.id !== parseInt(req.params.id));

    writeJSON(productsFilePath, products);
    res.json({ message: "Product deleted successfully" });
});

// ========== REVIEWS ==========
// Get Reviews for a Product
app.get("/reviews/:productId", (req, res) => {
    const productId = parseInt(req.params.productId);
    const reviews = readJSON(reviewsFilePath);
    const productReviews = reviews.filter((r) => r.productId === productId);

    res.json(productReviews);
});
app.get("/reviews", async (req, res) => {
    // const productId = parseInt(req.params.productId);
    const reviews = readJSON(reviewsFilePath);
    const productReviews = await analysis(reviews)

    res.json(productReviews);
});
app.get("/api/upload", async (req, res) => {
    // const productId = parseInt(req.params.productId);
    const reviews = readJSON(reviewsFilePath);
    const productReviews = await Suggestionanalysis(reviews)

    res.json(productReviews);
});
app.get("/suggestion", async (req, res) => {
    // const productId = parseInt(req.params.productId);
    const reviews = readJSON(reviewsFilePath);
    const productReviews = await Suggestionanalysis(reviews)

    res.json(productReviews);
});
// Add Review (Now includes userId)
app.post("/reviews", (req, res) => {
    const { productId, userId, username, text,productName } = req.body;
    if (!productId || !userId || !username || !text) {
        return res.status(400).json({ error: "All fields are required (productId, userId, username, text)" });
    }

    let reviews = readJSON(reviewsFilePath);
    const newReview = { id: reviews.length + 1, productId, userId, username, text,productName };

    reviews.push(newReview);
    writeJSON(reviewsFilePath, reviews);

    res.json({ message: "Review added successfully", review: newReview });
});

async function analysis(question) {
    return new Promise((resolve, reject) => {
        let data = JSON.stringify(
            {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": JSON.stringify(question)
                            }
                        ]
                    }
                ],
                "systemInstruction": {
                    "role": "user",
                    "parts": [
                        {
                            "text": "You are an AI assistant. Your task is to analyze eCommerce product reviews and identify the sentiment (positive, neutral, or negative). Respond strictly in JSON format as per the example:                              [                           {                               \"id\": 1,                               \"productId\": \"2\",     \"productName\":\"test\" \"2\",                               \"userId\": 2,                               \"username\": \"User\",                               \"text\": \"nice\",                               \"sentiment\": \"positive\"                           },                           {                               \"id\": 2,                               \"productId\": \"1\",                               \"userId\": 2,                               \"username\": \"User\",                               \"text\": \"Nice\",                               \"sentiment\": \"positive\"                           },                           {                               \"id\": 3,                               \"productId\": \"1\",                               \"userId\": 3,                               \"username\": \"User2\",    \"productName\":\"test\"                             \"text\": \"Not bad\",                               \"sentiment\": \"neutral\"                           }                       ]"
                        }
                    ]
                },
                "generationConfig": {
                    "temperature": 1,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 8192,
                    "responseMimeType": "application/json"
                }
            });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCXB3E5EVsXKN7JLOAba_VyWmnHZALEZyI',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                resolve(response.data?.candidates[0]?.content.parts[0]?.text)
            })
            .catch((error) => {
                console.log(error);
                reject(error)
            });
    })





}
async function Suggestionanalysis(question) {
    return new Promise((resolve, reject) => {
        let data = JSON.stringify(
            {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {
                                "text": JSON.stringify(question)
                            }
                        ]
                    }
                ],
                "systemInstruction": {
                    "role": "user",
                    "parts": [
                        {
                            "text": "You are an AI assistant. Your task is to analyze eCommerce product reviews and Give the product Improvement suggesttion to improve sales in the json format only:           [{\"productId\":\"1\",\"suggestion\":[\"Based on feedback, the product is generally perceived as 'Nice' or 'Not bad'.  Further investigation is needed to determine specific areas for improvement. Consider gathering more detailed feedback using surveys or questionnaires to understand what users like and dislike about the product.\"]},{\"productId\":\"2\",\"suggestion\":[\"The feedback for this product is mixed, with both 'nice' and 'worst' ratings.  This indicates inconsistency in the product or potentially varying expectations.  Investigate the reasons behind the negative feedback to identify specific quality issues or areas where the product fails to meet user needs.  Consider segmenting users to understand if certain user groups have consistently negative experiences.\"]},{\"productId\":\"5\",\"suggestion\":[\"The feedback for this product is highly varied, ranging from 'Nice product' and 'good' to 'Worst' and 'excellent'. This suggests a lack of consistency in product quality or user experience. A thorough review of the manufacturing process and quality control procedures is recommended. Gather additional user data to identify the factors contributing to the wide range of opinions. Analyze if 'Worst' feedback coincides with a specific batch or period.\"]}]"
                        }
                    ]
                },
                "generationConfig": {
                    "temperature": 1,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 8192,
                    "responseMimeType": "application/json"
                }
            });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCXB3E5EVsXKN7JLOAba_VyWmnHZALEZyI',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(JSON.stringify(response.data));
                resolve(response.data?.candidates[0]?.content.parts[0]?.text)
            })
            .catch((error) => {
                console.log(error);
                reject(error)
            });
    })





}
// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});