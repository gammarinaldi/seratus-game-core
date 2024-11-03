
# AI-Powered Trivia Quiz App (Indonesia)

Welcome to the AI-powered Trivia Quiz App! This app provides a fun, interactive trivia experience enhanced by AI, allowing users to test their knowledge across various knowledges. Additionally, the app offers premium features and subscriptions via the Midtrans payment gateway.

## Features

-   **AI Generated Questions**: Dynamic and intelligent questions generated or selected by AI to ensure varied and challenging quizzes.
-   **Multiple Categories**: There are various challenging topics like Penalaran Umum, Pemahaman Umum, dan Pengetahuan Kuantitatif.
-   **Leaderboards**: Track scores, compare with friends, and aim for top ranks!
-   **Midtrans Integration**: Easy and secure in-app purchases through the Midtrans payment gateway for premium quizzes or ad-free experiences.

## Getting Started

### Prerequisites

-   **Node.js** (v14 or higher)
-   **Midtrans Account**: Register at [Midtrans](https://midtrans.com/) to obtain your API key for payment processing.
-   **AI Model API Key**: Obtain an API key for your AI trivia provider (e.g., Gemini API).

### Installation

1.  **Clone the repository:**
    
    `git clone https://github.com/yourusername/seratus-game-core.git`
    `cd seratus-game-core `
    
2.  **Set up environment variables:**  
    Take a look at `env.local.example`, `env.production.example`, `Dockerfile.example`

3.  **Run with docker:**
    `docker compose up --build`
    `docker compose -f "docker-compose.prod.yml" up --build` (production)
    

### Payment Integration

The app integrates with Midtrans to allow secure in-app purchases for premium content and subscriptions.

-   **Midtrans API Documentation**: Refer to Midtrans API Docs for more details on setting up different payment methods.
-   **Security**: Ensure that your server key is stored securely and not exposed in the front end.

## Usage

1.  **Create an Account**: Sign up or log in.
2.  **Create a Quiz or be a player**: Choose available roles.
3.  **Upgrade to Premium**: Access more quizzes or remove ads by making in-app purchases via Midtrans.
4.  **Leaderboard**: Display player's ranking.

## Tech-Stack

-   **Frontend & Backend**: Next.js 14
-  **Game Server**: Socket.io
-   **Database**: MongoDB
-   **Payment Gateway**: Midtrans for secure transactions
-   **AI Model**: Gemini Pro

## Contributing

Contributions are welcome! Feel free to submit a pull request.

## License

This project is licensed under the MIT License. See LICENSE for details.
