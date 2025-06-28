# NetGuard AI - AI-Powered Threat Modeling Sandbox

![NetGuard AI Dashboard](https://placehold.co/800x450.png)
*<p align="center">A dynamic security dashboard populated by AI-generated scenario analysis.</p>*

---

## 🚀 Overview

NetGuard AI is a sophisticated, AI-powered cybersecurity sandbox designed for modern security teams. It allows users to model, analyze, and visualize complex cloud-native attack scenarios in a safe and controlled environment. Instead of relying on static threat intelligence, NetGuard AI uses generative AI to create dynamic, realistic attack simulations, generate countermeasures, and provide actionable insights, empowering teams to proactively test and strengthen their defenses.

## ✨ Core Features

-   **AI-Powered Scenario Generation:** Describe an attack in plain English (e.g., "data exfiltration from an S3 bucket"), and the AI will generate a realistic, simulated PowerShell or shell script.
-   **Dynamic Threat Modeling:** Run any script in the sandbox to generate a complete attack scenario, including a list of security events, affected cloud resources, and key performance metrics.
-   **Intelligent Countermeasure Analysis:** The AI not only suggests a defense script but also simulates an engagement between the attack and defense, providing an "Effectiveness Score" and a step-by-step interaction log.
-   **Automated Response Planning:** For any security event, the AI can generate a concise, actionable incident response plan for a security analyst.
-   **Interactive Dashboard:** Visualize the impact of an attack with dynamic charts for system activity and a real-time log of security events.

## 🤖 How the AI Connects Everything

NetGuard AI's intelligence is powered by a series of interconnected AI agents (Genkit flows). These agents work together to create a cohesive and realistic scenario from a single piece of input. **The key innovation is that NetGuard AI does not use any static mock data.** Instead, it generates a complete, dynamic scenario in real-time.

Here’s how the different AI components work together:

1.  **Script Generation (`generateAttackScript`):** When a user describes an attack, this agent acts as a "Red Team" expert. It interprets the request and writes a plausible but simulated attack script, ensuring no real harm can be done by using placeholder commands like `Write-Host`.

2.  **Scenario Modeling (`modelAttackScenario`):** This is the core engine and central hub of the application. When a script is submitted for analysis, this agent acts as a "Cloud Intrusion Detection System." It meticulously analyzes the script's intent and generates a rich, interconnected dataset, including:
    -   A professional threat analysis report with a risk score.
    -   A list of realistic security events (e.g., "Anomalous spike in traffic").
    -   A set of affected cloud resources (e.g., "EC2 instance `i-123xyz` is now 'Compromised'").
    -   A suggested countermeasure script.

3.  **Engagement Analysis (`analyzeInteraction`):** To test the countermeasure, this "Purple Team" agent simulates a head-to-head battle between the attack script and the defense script. It produces a detailed interaction log, an effectiveness score, and even suggests an *improved* version of the defense script based on the outcome.

4.  **Response Planning (`generateResponsePlan`):** When a user needs help with a specific security event, this agent acts as a "SOC Analyst" playbook generator, creating clear, actionable steps for remediation.

The `modelAttackScenario` flow is the central orchestrator. It takes a single input (the script) and directs the creation of the entire interconnected dataset. It doesn't just list events; it ensures that a specific command in the script logically leads to a specific security event, which in turn changes the status of a specific cloud resource, all while influencing the dashboard metrics. This chain of AI-driven reasoning is what connects all the pieces and creates a unique, believable story for every analysis you run.

This multi-agent approach allows NetGuard AI to go beyond simple analysis and create a truly dynamic and interactive learning environment.

## 🛠️ Tech Stack

-   **Frontend:** Next.js (App Router), React, TypeScript
-   **Styling:** Tailwind CSS, ShadCN UI
-   **AI/Backend:** Google Genkit, Google AI Platform
-   **State Management:** React Context API
-   **Charts:** Recharts

## ⚙️ Running Locally

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your environment variables:**
    Create a `.env` file in the root of the project and add your Google AI API key:
    ```
    GOOGLE_API_KEY=your_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:9002`.
