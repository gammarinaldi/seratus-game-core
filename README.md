
# AI-Powered Trivia Quiz App

Welcome to the AI-powered Trivia Quiz App! This app provides a fun, interactive trivia experience enhanced by AI, allowing users to test their knowledge across various topics and categories. Additionally, the app offers premium features and subscriptions via the Midtrans payment gateway.

## Features

-   **AI-Enhanced Questions**: Dynamic and intelligent questions generated or selected by AI to ensure varied and challenging quizzes.
-   **Multiple Categories**: Users can select from various topics like Science, History, Pop Culture, and more.
-   **Leaderboards**: Track scores, compare with friends, and aim for top ranks!
-   **Midtrans Integration**: Easy and secure in-app purchases through the Midtrans payment gateway for premium quizzes or ad-free experiences.

## Getting Started

### Prerequisites

-   **Node.js** (v14 or higher)
-   **Midtrans Account**: Register at [Midtrans](https://midtrans.com/) to obtain your API key for payment processing.
-   **LLM API Key**: Obtain an API key for your AI trivia provider (e.g., Gemini API).

### Installation

1.  **Clone the repository:**
    
    `git clone https://github.com/yourusername/seratus-quiz-app.git`
    `cd seratus-quiz-app `
    
2.  **Set up environment variables:**  
    Take a look at `env.local.example`
    Take a look at `env.production.example`
    Take a look at `Dockerfile.example`

3.  **Run with docker:**
    `docker compose up --build`
    

### Payment Integration

The app integrates with Midtrans to allow secure in-app purchases for premium content and subscriptions.

-   **Midtrans API Documentation**: Refer to Midtrans API Docs for more details on setting up different payment methods.
-   **Security**: Ensure that your server key is stored securely and not exposed in the front end.

## Usage

1.  **Create an Account**: Sign up or log in.
2.  **Create a Quiz or be a player**: Choose available roles.
3.  **Upgrade to Premium**: Access more quizzes or remove ads by making in-app purchases via Midtrans.
4.  **Track Progress (TODO)**: Check the leaderboard and challenge friends to improve your ranking.

## Technologies Used

-   **Frontend**: Next.js 14
-   **Backend**: Next.js 14
-  **Game Server**: Websocket in Node.js
-   **Database**: MongoDB
-   **Payment Gateway**: Midtrans for secure transactions
-   **AI Integration**: Gemini API

## Contributing

Contributions are welcome! Feel free to submit a pull request.

## License

This project is licensed under the MIT License. See LICENSE for details.
