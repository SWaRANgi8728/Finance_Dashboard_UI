# Finance Dashboard UI

## Overview
**Finance Dashboard (FinDash)** is a responsive web application built using **HTML, CSS, Bootstrap, and JavaScript**.  
It allows users to **track and analyze financial activity**, view transactions, and gain insights into spending patterns.  
The project uses **mock data stored in localStorage** and **simulates role-based UI behavior**.

## Features

### Dashboard Overview
- **Summary Cards**: Displays **Total Balance**, **Income**, and **Expenses**.
- **Charts**:
  - **Financial Trend** – line chart showing income vs expense over time.
  - **Spending Breakdown** – doughnut chart showing expenses by category.

### Transactions Section
- Displays a list of transactions including:
  - Date
  - Category
  - Amount
  - Type (Income/Expense)
- **Basic Interactions**:
  - Search by category
  - Sorting by date (oldest to newest)
  - Add, Edit, Delete (Admin role only)

### Role-Based UI
- **Viewer**: Can view summaries, charts, and transactions.
- **Admin**: Can add/edit/delete transactions.
- Role switch available via **dropdown** in the topbar.

### Insights Section
- Shows key insights from transaction data:
  - Highest Spending Category
  - Monthly Income vs Expense
  - Top Categories
  - Total Transactions

### State Management
- Uses **JavaScript arrays and objects** to manage:
  - Transactions
  - Search filters
  - Selected role
- Data persisted in **localStorage**.


## Technologies Used
- **HTML5** – Structure & markup  
- **CSS3 & Bootstrap 5** – Styling & responsive design  
- **JavaScript** – Interactivity, state management, and role simulation  
- **Chart.js** – Line and doughnut charts for data visualization  
- **Bootstrap Icons** – UI icons for navigation and actions  

## How to Run
1. **Clone the repository**:

   git clone https://github.com/SWaRANgi8728/finance_dashboard_ui.git
