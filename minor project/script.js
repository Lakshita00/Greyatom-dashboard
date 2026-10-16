// Get the main elements from the page
const exceptionForm = document.querySelector("#exceptionForm");
const exceptionTable = document.querySelector("#exceptionTable");
const typeFilter = document.querySelector("#typeFilter");
const statusFilter = document.querySelector("#statusFilter");

const totalCount = document.querySelector("#totalCount");
const openCount = document.querySelector("#openCount");
const resolvedCount = document.querySelector("#resolvedCount");
const resultCount = document.querySelector("#resultCount");
const emptyRow = document.querySelector("#emptyRow");

// Keep the exception records in an array while the page is open
let exceptions = [];
let nextId = 1;

// Show today's date in the heading
const todayDate = document.querySelector("#todayDate");
todayDate.textContent = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
});

// Add a new exception when the form is submitted
exceptionForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const deliveryId = document.querySelector("#deliveryId").value.trim();
    const customerName = document.querySelector("#customerName").value.trim();
    const issueType = document.querySelector("#issueType").value;
    const selectedPriority = document.querySelector('input[name="priority"]:checked');
    const notes = document.querySelector("#notes").value.trim();

    // Check that the required fields have been filled in
    if (deliveryId === "" || customerName === "" || issueType === "" || !selectedPriority) {
        alert("Please fill in all required fields.");
        return;
    }

    const newException = {
        id: nextId,
        deliveryId: deliveryId,
        customerName: customerName,
        issueType: issueType,
        priority: selectedPriority.value,
        notes: notes,
        status: "Open"
    };

    nextId = nextId + 1;
    exceptions.push(newException);

    addRow(newException);
    updateCounts();
    applyFilters();
    exceptionForm.reset();
});

// Create a table row for one exception
function addRow(exception) {
    const row = document.createElement("tr");
    row.dataset.id = exception.id;

    const deliveryCell = document.createElement("td");
    deliveryCell.textContent = exception.deliveryId;
    deliveryCell.classList.add("delivery-id");

    const customerCell = document.createElement("td");
    customerCell.textContent = exception.customerName;

    const issueCell = document.createElement("td");
    issueCell.textContent = exception.issueType;
    issueCell.title = exception.notes;

    const priorityCell = document.createElement("td");
    const priorityLabel = document.createElement("span");
    priorityLabel.textContent = exception.priority;
    priorityLabel.classList.add("priority");

    if (exception.priority === "Low") {
        priorityLabel.classList.add("priority-low");
    } else if (exception.priority === "Medium") {
        priorityLabel.classList.add("priority-medium");
    } else {
        priorityLabel.classList.add("priority-high");
    }
    priorityCell.appendChild(priorityLabel);

    const statusCell = document.createElement("td");
    const statusLabel = document.createElement("span");
    statusLabel.textContent = exception.status;
    statusLabel.classList.add("status");
    statusLabel.classList.add("status-open");
    statusCell.appendChild(statusLabel);

    const actionsCell = document.createElement("td");
    const actions = document.createElement("div");
    actions.classList.add("actions");

    const resolveButton = document.createElement("button");
    resolveButton.textContent = "Resolve";
    resolveButton.classList.add("resolve-button");
    resolveButton.dataset.action = "resolve";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    deleteButton.dataset.action = "delete";

    actions.appendChild(resolveButton);
    actions.appendChild(deleteButton);
    actionsCell.appendChild(actions);

    row.appendChild(deliveryCell);
    row.appendChild(customerCell);
    row.appendChild(issueCell);
    row.appendChild(priorityCell);
    row.appendChild(statusCell);
    row.appendChild(actionsCell);

    exceptionTable.appendChild(row);
    row._statusLabel = statusLabel;
    row._resolveButton = resolveButton;
}

// Handle Resolve and Delete using event delegation
exceptionTable.addEventListener("click", function (event) {
    const clickedButton = event.target;

    if (clickedButton.tagName !== "BUTTON") {
        return;
    }

    const row = clickedButton.closest("tr");
    const exceptionId = Number(row.dataset.id);
    const exception = exceptions.find(function (item) {
        return item.id === exceptionId;
    });

    if (!exception) {
        return;
    }

    if (clickedButton.dataset.action === "resolve") {
        if (exception.status === "Open") {
            exception.status = "Resolved";
            row.querySelector(".status").textContent = "Resolved";
            row.querySelector(".status").classList.remove("status-open");
            row.querySelector(".status").classList.add("status-resolved");
            row.classList.add("resolved-row");
            clickedButton.disabled = true;
            clickedButton.textContent = "Resolved";
            updateCounts();
            applyFilters();
        }
    }

    if (clickedButton.dataset.action === "delete") {
        const shouldDelete = confirm("Are you sure you want to delete this exception?");
        if (shouldDelete) {
            exceptions = exceptions.filter(function (item) {
                return item.id !== exceptionId;
            });
            row.remove();
            updateCounts();
            applyFilters();
        }
    }
});

// Filter table rows without removing records from the array
typeFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);

function applyFilters() {
    const selectedType = typeFilter.value;
    const selectedStatus = statusFilter.value;
    const rows = exceptionTable.querySelectorAll("tr[data-id]");
    let visibleRows = 0;

    rows.forEach(function (row) {
        const exceptionId = Number(row.dataset.id);
        const exception = exceptions.find(function (item) {
            return item.id === exceptionId;
        });

        if (!exception) {
            return;
        }

        const matchesType = selectedType === "All" || exception.issueType === selectedType;
        const matchesStatus = selectedStatus === "All" || exception.status === selectedStatus;

        if (matchesType && matchesStatus) {
            row.style.display = "";
            visibleRows = visibleRows + 1;
        } else {
            row.style.display = "none";
        }
    });

    // Show the empty message only when there are no matching records
    if (visibleRows === 0) {
        if (!document.querySelector("#emptyRow")) {
            const newEmptyRow = document.createElement("tr");
            newEmptyRow.id = "emptyRow";
            newEmptyRow.innerHTML = '<td colspan="6" class="empty-state"><strong>No matching exceptions</strong><p>Try changing the filters or add a new issue.</p></td>';
            exceptionTable.appendChild(newEmptyRow);
        }
    } else {
        const messageRow = document.querySelector("#emptyRow");
        if (messageRow) {
            messageRow.remove();
        }
    }

    resultCount.textContent = "Showing " + visibleRows + " of " + exceptions.length + " exceptions";
}

function updateCounts() {
    let open = 0;
    let resolved = 0;

    exceptions.forEach(function (exception) {
        if (exception.status === "Open") {
            open = open + 1;
        } else {
            resolved = resolved + 1;
        }
    });

    totalCount.textContent = exceptions.length;
    openCount.textContent = open;
    resolvedCount.textContent = resolved;
}
