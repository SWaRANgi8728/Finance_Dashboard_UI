// ✅ Only manual data (no default)
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let role = "viewer";
let lineChartInstance = null;
let pieChartInstance = null;

// Role Switch
document.getElementById("roleSelect").addEventListener("change", (e) => {
  role = e.target.value;
  document.getElementById("addBtn").classList.toggle("d-none", role !== "admin");
  renderTable();
});

// Save transactions
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Update summary cards
function updateSummary() {
  let income = 0, expense = 0;
  transactions.forEach(t => t.type === "income" ? income += t.amount : expense += t.amount);
  document.getElementById("income").innerText = "₹" + income;
  document.getElementById("expense").innerText = "₹" + expense;
  document.getElementById("balance").innerText = "₹" + (income - expense);
}

// Validate date
function isValidDate(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
}

// Add transaction (manual)
document.getElementById("addBtn").addEventListener("click", () => {
  if (role !== "admin") return;

  const date = prompt("Enter date (YYYY-MM-DD):");
  const category = prompt("Enter category:");
  const amount = parseFloat(prompt("Enter amount:"));
  const type = prompt("Type (income/expense):").toLowerCase();

  if (!isValidDate(date) || !category || isNaN(amount) || amount <= 0 || !["income", "expense"].includes(type)) {
    alert("Invalid input!");
    return;
  }

  transactions.push({ date, category, amount, type });
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  saveTransactions();
  updateSummary();
  renderTable();
  generateInsights();
  renderCharts();
});

// Edit transaction
function editTransaction(idx) {
  const t = transactions[idx];
  const date = prompt("Edit date (YYYY-MM-DD):", t.date);
  const category = prompt("Edit category:", t.category);
  const amount = parseFloat(prompt("Edit amount:", t.amount));
  const type = prompt("Edit type (income/expense):", t.type).toLowerCase();

  if (!isValidDate(date) || !category || isNaN(amount) || amount <= 0 || !["income", "expense"].includes(type)) {
    alert("Invalid input!");
    return;
  }

  transactions[idx] = { date, category, amount, type };
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  saveTransactions();
  updateSummary();
  renderTable();
  generateInsights();
  renderCharts();
}

// Delete transaction
function deleteTransaction(idx) {
  if (!confirm("Are you sure you want to delete this transaction?")) return;
  transactions.splice(idx, 1); // remove the transaction
  saveTransactions();
  updateSummary();
  renderTable();
  generateInsights();
  renderCharts();
}

// Render transactions table
function renderTable() {
  const search = document.getElementById("search").value.toLowerCase();
  const table = document.getElementById("table");

  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const filtered = sortedTransactions.filter(t => t.category.toLowerCase().includes(search));

  table.innerHTML = "";

  if (filtered.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No transactions found</td></tr>`;
    return;
  }

  filtered.forEach(t => {
    const originalIndex = transactions.findIndex(tr =>
      tr.date === t.date && tr.category === t.category && tr.amount === t.amount && tr.type === t.type
    );

    table.innerHTML += `
      <tr>
        <td>${t.date}</td>
        <td>${t.category}</td>
        <td>₹${t.amount}</td>
        <td><span class="badge ${t.type === 'income' ? 'bg-success' : 'bg-danger'}">${t.type}</span></td>
        <td>
          ${role === "admin" ? `
            <i class="bi bi-pencil-square text-warning editIcon" style="cursor:pointer;" data-index="${originalIndex}"></i>
            &nbsp;
            <i class="bi bi-trash text-danger deleteIcon" style="cursor:pointer;" data-index="${originalIndex}"></i>
          ` : ""}
        </td>
      </tr>`;
  });

  // Attach click events for edit icons
  document.querySelectorAll(".editIcon").forEach(icon => {
    icon.addEventListener("click", () => {
      const idx = icon.getAttribute("data-index");
      editTransaction(idx);
    });
  });

  // Attach click events for delete icons
  document.querySelectorAll(".deleteIcon").forEach(icon => {
    icon.addEventListener("click", () => {
      const idx = icon.getAttribute("data-index");
      deleteTransaction(idx);
    });
  });
}

// Search input
document.getElementById("search").addEventListener("input", renderTable);

// Generate insights
function generateInsights() {
  if (transactions.length === 0) {
    document.getElementById("insightHighest").innerText = "-";
    document.getElementById("insightMonthly").innerText = "-";
    document.getElementById("insightTopCategories").innerText = "-";
    document.getElementById("insightTotal").innerText = "0";
    return;
  }

  const categoryTotals = {};
  const monthly = {};

  transactions.forEach(t => {
    if (t.type === "expense") categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    const month = t.date.slice(0, 7);
    if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
    monthly[month][t.type] += t.amount;
  });

  const maxCategory = Object.keys(categoryTotals).length > 0
    ? Object.keys(categoryTotals).reduce((a, b) => categoryTotals[a] > categoryTotals[b] ? a : b)
    : "-";

  const months = Object.keys(monthly).sort();
  const lastMonth = months[months.length - 1];
  const incomeDiff = monthly[lastMonth]?.income || 0;
  const expenseDiff = monthly[lastMonth]?.expense || 0;
  const comparison = `Income: ₹${incomeDiff}, Expense: ₹${expenseDiff}`;

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(c => `${c[0]}: ₹${c[1]}`)
    .join(", ");

  document.getElementById("insightHighest").innerText = maxCategory || "-";
  document.getElementById("insightMonthly").innerText = comparison;
  document.getElementById("insightTopCategories").innerText = topCategories || "-";
  document.getElementById("insightTotal").innerText = transactions.length;
}

// Render charts
function renderCharts() {
  if (lineChartInstance) lineChartInstance.destroy();
  if (pieChartInstance) pieChartInstance.destroy();
  if (transactions.length === 0) return;

  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sortedTransactions.map(t => t.date);
  const incomeData = sortedTransactions.map(t => t.type === "income" ? t.amount : 0);
  const expenseData = sortedTransactions.map(t => t.type === "expense" ? t.amount : 0);

  lineChartInstance = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Income", data: incomeData, borderColor: "#22c55e", tension: 0.4 },
        { label: "Expense", data: expenseData, borderColor: "#ef4444", tension: 0.4 }
      ]
    }
  });

  const dataMap = {};
  transactions.forEach(t => dataMap[t.category] = (dataMap[t.category] || 0) + t.amount);

  pieChartInstance = new Chart(document.getElementById("pieChart"), {
    type: "doughnut",
    data: { labels: Object.keys(dataMap), datasets: [{ data: Object.values(dataMap) }] },
    options: { plugins: { legend: { display: true, position: 'bottom' } } }
  });
}

// Initialize
updateSummary();
renderTable();
generateInsights();
renderCharts();

// Section Switch
  function showSection(section, event){
    event.preventDefault();
    document.getElementById("dashboardSection").style.display = section==="dashboard"?"block":"none";
    document.getElementById("transactionsSection").style.display = section==="transactions"?"block":"none";
    document.getElementById("insightsSection").style.display = section==="insights"?"block":"none";
  
    document.querySelectorAll(".sidebar .nav-link").forEach(link=>link.classList.remove("active"));
    event.currentTarget.classList.add("active");
  }
  
  // Initialize
  updateSummary();
  renderTable();
  generateInsights();
  renderCharts();

  function showSection(section, event) {
    // Get all sections
    const dashboard = document.getElementById("dashboardSection");
    const transactions = document.getElementById("transactionsSection");
    const insights = document.getElementById("insightsSection");
  
    // Hide all
    dashboard.style.display = "none";
    transactions.style.display = "none";
    insights.style.display = "none";
  
    // Show based on click
    if (section === "dashboard") {
      dashboard.style.display = "block";
      transactions.style.display = "block";
      insights.style.display = "block";
    }
  
    if (section === "transactions") {
      transactions.style.display = "block";
    }
  
    if (section === "insights") {
      insights.style.display = "block";
    }
  
    // Active class update
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
    event.currentTarget.classList.add("active");
  }

  