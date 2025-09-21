# Bijective Base-6 Calculator & Explorer

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://bijective-base6-calc.onrender.com)
![Framework](https://img.shields.io/badge/Framework-FastAPI-green?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square)

An interactive web app exploring bijective base-6, a number system with no zero (1-6, 11-16, etc.). This educational tool features a hands-on calculator and explains the system's advantages for data encoding, URL-safe identifiers, and cryptography. Built with Python and FastAPI.

### [➡️ View the Live Demo](https://bijective-base6-calc.onrender.com)

## ✨ Features

*   **Interactive Calculator**: Perform addition, subtraction, multiplication, and division on bijective base-6 numbers.
*   **Clear Explanations**: Understand the core concepts of a number system without a zero.
*   **Detailed Step-by-Step Solutions**: See how each calculation is performed by converting to decimal and back.
*   **Advanced Concepts**: Learn about the practical applications of bijective numeration in cryptography, data serialization, and hashing.
*   **Robust Error Handling**: The calculator gracefully handles invalid inputs and provides clear feedback.

## 💡 What is Bijective Base-6?

This application is an educational tool for exploring **bijective base-6 numeration**. Unlike standard number systems, it has two key properties:

1.  **No Zero**: The digits are `1, 2, 3, 4, 5, 6`.
2.  **Bijective**: Every positive integer has one, and only one, unique string representation.

Counting proceeds like an odometer that can't show zero. After `6`, the next number "rolls over" to `11`. This property makes it incredibly useful in computer science for creating compact, unambiguous identifiers.

## 🛠️ Tech Stack

*   **Backend**: Python, FastAPI, Uvicorn
*   **Frontend**: HTML5, CSS3, Vanilla JavaScript
*   **Deployment**: Render

## 🚀 Running Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Python 3.8+
*   An active internet connection to download packages

### Installation

1.  **Clone the repository:**
    
