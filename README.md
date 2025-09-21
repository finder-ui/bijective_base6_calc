# Bijective Base-6 Calculator & Explorer

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://bijective-base6-calc.onrender.com)
[![Framework](https://img.shields.io/badge/Framework-FastAPI-green?style=flat-square)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

An interactive web app for exploring the **bijective base-6 number system**—a system with no zero. This educational tool features a hands-on calculator, a live number system converter, and detailed explanations of the system's advantages for data encoding, URL-safe identifiers, and cryptography.

### [➡️ View the Live Demo](https://bijective-base6-calc.onrender.com)

---

## Table of Contents

- [Features](#-features)
- [What is Bijective Base-6?](#-what-is-bijective-base-6)
- [Tech Stack & Rationale](#-tech-stack--rationale)
- [Running Locally](#-running-locally)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **Live Conversion Explorer**: Instantly see any decimal number represented in Decimal, Binary, Hexadecimal, and Bijective Base-6.
- **All-in-One Calculator**: Enter two bijective numbers and get the results for Addition, Subtraction, Multiplication, and Division at once.
- **Reference Tables**: View pre-calculated 12x12 Addition and Multiplication tables to easily see patterns.
- **Themed UI**: Switch between a clean light mode and a "digital rain" dark mode, with your preference saved locally.
- **Detailed Explanations**: In-depth articles on numerical systems, the bijective conversion algorithm, and its practical applications in computer science.
- **Modern & Responsive**: Built with a mobile-first approach and includes subtle animations for a better user experience.

---

## 💡 What is Bijective Base-6?

This application is an educational tool for exploring **bijective base-6 numeration**. Unlike standard number systems, it has two key properties:

1.  **No Zero**: The digits are `1, 2, 3, 4, 5, 6`.
2.  **Bijective**: Every positive integer has one, and only one, unique string representation (e.g., `7` is always `11`, never `011`).

Counting proceeds like an odometer that can't show zero. After `6`, the next number "rolls over" to `11`. This property makes it incredibly useful in computer science for creating compact, unambiguous identifiers.

---

## 🛠️ Tech Stack & Rationale

| Technology | Purpose |
| :--- | :--- |
| **Python** | The core language for all backend logic. |
| **FastAPI** | A modern, high-performance web framework for building the API endpoints. |
| **Uvicorn** | The ASGI server that runs the FastAPI application. |
| **HTML5 / CSS3** | Used for the structure and styling of the user interface. |
| **Vanilla JavaScript** | Powers all client-side interactivity, including theme switching, API calls, and dynamic content rendering. |
| **Render** | The cloud platform used for free, continuous deployment directly from GitHub. |

---

## 🚀 Running Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Python 3.8+
- An active internet connection to download packages

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/tripping-alien/bijective_base6_calc.git
    ```
2.  **Navigate to the project directory:**
    ```sh
    cd bijective_base6_calc
    ```
3.  **Create and activate a virtual environment:**
    - **Windows:**
      ```sh
      python -m venv .venv
      .\.venv\Scripts\Activate.ps1
      ```
    - **macOS / Linux:**
      ```sh
      python3 -m venv .venv
      source .venv/bin/activate
      ```
4.  **Install the required packages:**
    ```sh
    pip install -r requirements.txt
    ```
5.  **Run the application:**
    ```sh
    uvicorn app:app --reload
    ```
6.  **Open your browser** and navigate to `http://127.0.0.1:8000`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
