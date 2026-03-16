// 1. Initialize Supabase
// These variables will now be loaded from config.js (which is not on GitHub)
const _supabase = supabase.createClient(_supabaseURL, _supabaseKey);

let sortAscending = true;

// Update your login function to use the variables from config.js
function login() {
    const userField = document.getElementById("username")?.value || ""; 
    const passField = document.getElementById("password")?.value || "";

    // _ADMIN_USER and _ADMIN_PASS come from config.js
    if (userField === _ADMIN_USER && passField === _ADMIN_PASS) {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid Username or Password.");
    }
}

// Add this function to the bottom of app.js to handle logging out
function logout() {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "index.html";
}
window.onload = function () {

    // SECURITY CHECK: Redirect to login if not logged in
    // Skip this check only if we are already on the index.html page
    const path = window.location.pathname;
    const isLoginPage = path.endsWith("index.html") || path === "/";
    
    if (!isLoginPage && localStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "index.html";
        return;
    }

    // If we are on Dashboard
    if (document.getElementById("caseTable")) {
        loadDashboard();
    }
    // If we are on Upcoming Hearings page
    if (document.getElementById("upcomingTable")) {
        loadUpcomingPage();
    }
};

// function addCase() {
//   let caseNumber = document.getElementById("caseNumber").value;
//   let department = document.getElementById("department").value;
//   let hearingDate = document.getElementById("hearingDate").value;

//   let fileInput = document.getElementById("caseFile");
//   let file = fileInput.files[0];

//   let reader = new FileReader();

//   reader.onload = function (e) {
//     let caseData = {
//       number: caseNumber,
//       department: department,
//       date: hearingDate,
//       fileName: file ? file.name : "No File",
//       fileData: file ? e.target.result : null,
//     };

//     let cases = JSON.parse(localStorage.getItem("cases")) || [];

//     cases.push(caseData);

//     localStorage.setItem("cases", JSON.stringify(cases));

//     alert("Case Added Successfully");

//     window.location.href = "dashboard.html";
//   };

//   if (file) {
//     reader.readAsDataURL(file);
//   } else {
//     reader.onload({ target: { result: null } });
//   }
// }

// function addCase() {
//   let caseNumber = document.getElementById("caseNumber").value;
//   let department = document.getElementById("department").value;
//   let hearingDate = document.getElementById("hearingDate").value;

//   // --- UPDATED VALIDATION BLOCK ---
//   if (!caseNumber.trim()) {
//     alert("Please enter a Case Number.");
//     return;
//   }
  
//   if (!hearingDate.trim()) {
//     alert("Please select a Hearing Date.");
//     return;
//   }
//   // --------------------------------

//   let fileInput = document.getElementById("caseFile");
//   let file = fileInput.files[0];

//   let reader = new FileReader();

//   reader.onload = function (e) {
//     let caseData = {
//       number: caseNumber,
//       department: department,
//       date: hearingDate,
//       fileName: file ? file.name : "No File",
//       fileData: file ? e.target.result : null,
//     };

//     let cases = JSON.parse(localStorage.getItem("cases")) || [];
//     cases.push(caseData);
//     localStorage.setItem("cases", JSON.stringify(cases));

//     alert("Case Added Successfully");
//     window.location.href = "dashboard.html";
//   };

//   if (file) {
//     reader.readAsDataURL(file);
//   } else {
//     reader.onload({ target: { result: null } });
//   }
// }

// 2. Function to Add Case to Supabase
// 2. Function to Add Case to Supabase
async function addCase() {
    // const caseNumber = document.getElementById("caseNumber").value;
    // const department = document.getElementById("department").value;
    // const hearingDate = document.getElementById("hearingDate").value;
    // const fileInput = document.getElementById("caseFile");
    // const file = fileInput.files[0];

    // if (!caseNumber || !hearingDate) {
    //     alert("Please fill in Case Number and Date");
    //     return;
    // }
    const caseNumber = document.getElementById("caseNumber").value;
    const department = document.getElementById("department").value;
    const hearingDate = document.getElementById("hearingDate").value;
    const fileInput = document.getElementById("caseFile");
    const file = fileInput.files[0];

    // --- NEW NUMERIC VALIDATION ---
    // This checks if the case number contains ONLY digits (0-9) and /
    if (!/^[0-9/]+$/.test(caseNumber)) {
        alert("Please enter a valid Case Number (Numbers and / only).");
        return;
    }

    if (!caseNumber || !hearingDate) {
        alert("Please fill in Case Number and Date");
        return;
    }

    let fileData = null;
    let fileName = "No File";

    if (file) {
        fileName = file.name;
        // Convert file to Base64 to store in text column
        fileData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    }

    // Insert into Supabase
    const { data, error } = await _supabase
        .from('cases')
        .insert([{ 
            case_number: caseNumber, 
            department: department, 
            hearing_date: hearingDate, 
            file_name: fileName, 
            file_data: fileData 
        }]);

    if (error) {
        console.error("Error:", error);
        alert("Upload Failed: " + error.message);
    } else {
        alert("Case Saved successfully!");
        window.location.href = "dashboard.html";
    }
}

// async function loadUpcomingPage() {
//     const upcomingTable = document.getElementById("upcomingTable");
//     if (!upcomingTable) return;

//     const { data: cases, error } = await _supabase
//         .from('cases')
//         .select('*')
//         .order('hearing_date', { ascending: true });

//     if (error) {
//         console.error("Supabase Error:", error);
//         return;
//     }

//     upcomingTable.innerHTML = ""; // Clear table
//     let today = new Date();

//     cases.forEach((c) => {
//         let hearing = parseIndianDate(c.hearing_date);
//         let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

//         // Show cases for the next 7 days
//         if (diffDays <= 7 && diffDays >= 0) {
//             const statusText = diffDays === 0 ? "⚠ Today" : (diffDays === 1 ? "⚠ Tomorrow" : `In ${diffDays} days`);
//             const statusColor = diffDays <= 1 ? "red" : "orange";

//             // We build the entire row at once to ensure the Download button is included
//             const row = `
//                 <tr>
//                     <td>${c.case_number}</td>
//                     <td>${c.department}</td>
//                     <td>${c.hearing_date}</td>
//                     <td>
//                         ${c.file_data ? `
//                             <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
//                                 <span onclick="viewFileCloud('${c.file_data}')" style="cursor:pointer; color:#1F4E79; font-weight:bold;">View</span>
//                                 <span style="color: #ccc;">|</span>
//                                 <a href="${c.file_data}" download="${c.file_name || 'CaseFile.pdf'}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
//                             </div>` : "No File"}
//                     </td>
//                     <td style="color:${statusColor}; font-weight:bold;">${statusText}</td>
//                 </tr>`;
            
//             upcomingTable.innerHTML += row;
//         }
//     });
// }

async function loadUpcomingPage() {
    const upcomingTable = document.getElementById("upcomingTable");
    if (!upcomingTable) return;

    // 1. Fetch data
    const { data: cases, error } = await _supabase
        .from('cases')
        .select('*')
        .order('hearing_date', { ascending: true });

    if (error) {
        console.error("Supabase Error:", error);
        return;
    }

    // 2. Setup Stat Elements
    const totalCasesEl = document.getElementById("totalCases");
    const upcomingCountEl = document.getElementById("upcomingCount");
    if (totalCasesEl) totalCasesEl.innerText = cases.length;

    upcomingTable.innerHTML = ""; // Clear table
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Zero out time for accuracy

    let upcomingCount = 0;

    cases.forEach((c) => {
        let hearing = parseIndianDate(c.hearing_date);
        if (hearing) hearing.setHours(0, 0, 0, 0);

        let diffTime = hearing.getTime() - today.getTime();
        let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // Logic for the stats and the table
        if (diffDays <= 7 && diffDays >= 0) {
            upcomingCount++; // Increment for the stat box
            
            const statusText = diffDays === 0 ? "⚠ Today" : (diffDays === 1 ? "⚠ Tomorrow" : `In ${diffDays} days`);
            const statusColor = diffDays <= 1 ? "red" : "orange";

            const row = `
                <tr>
                    <td>${c.case_number}</td>
                    <td>${c.department}</td>
                    <td>${c.hearing_date}</td>
                    <td>
                        ${c.file_data ? `
                            <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                                <span onclick="viewFileCloud('${c.file_data}')" style="cursor:pointer; color:#1F4E79; font-weight:bold;">View</span>
                                <span style="color: #ccc;">|</span>
                                <a href="${c.file_data}" download="${c.file_name || 'CaseFile.pdf'}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
                            </div>` : "No File"}
                    </td>
                    <td style="color:${statusColor}; font-weight:bold;">${statusText}</td>
                </tr>`;
            
            upcomingTable.innerHTML += row;
        }
    });

    // 3. Update the upcoming count box
    if (upcomingCountEl) upcomingCountEl.innerText = upcomingCount;
}

async function loadDashboard() {
    const { data: cases, error } = await _supabase
        .from('cases')
        .select('*')
        .order('hearing_date', { ascending: true });

    if (error) {
        console.error("Error fetching from Supabase:", error);
        return;
    }

    // 1. Update Top Stats
    const totalCasesEl = document.getElementById("totalCases");
    const upcomingCountEl = document.getElementById("upcomingCount");
    if (totalCasesEl) totalCasesEl.innerText = cases.length;

    // 2. Setup Table Body
    // Check if you have a tbody with this ID, if not, it falls back to the table
    let tableBody = document.getElementById("caseTableBody") || document.getElementById("caseTable");
    if (!tableBody) return;
    
    tableBody.innerHTML = ""; 

    let upcomingCount = 0;
    let urgentHearings = [];
    let today = new Date();

    cases.forEach((c) => {
        let hearing = parseIndianDate(c.hearing_date);
        let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7 && diffDays >= 0) upcomingCount++;
        if (diffDays === 0) urgentHearings.push(`Case ${c.case_number} — Today`);
        if (diffDays === 1) urgentHearings.push(`Case ${c.case_number} — Tomorrow`);

        let statusText = diffDays < 0 ? "Passed" : (diffDays === 0 ? "⚠ Today" : (diffDays === 1 ? "⚠ Tomorrow" : "Scheduled"));
        let statusColor = diffDays <= 1 && diffDays >= 0 ? "red" : (diffDays < 0 ? "gray" : "#1F4E79");

        const row = `<tr>
            <td>${c.case_number}</td>
            <td>${c.department}</td>
            <td>${c.hearing_date}</td>
            <td>
                ${c.file_data ? `
                    <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
                        <span onclick="viewFileCloud('${c.file_data}')" style="cursor:pointer; color:#1F4E79; font-weight:bold;">View</span>
                        <span style="color: #ccc;">|</span>
                        <a href="${c.file_data}" download="${c.file_name || 'CaseFile.pdf'}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
                    </div>` : "No File"}
            </td>
            <td>
                <input type="text" id="remarks-${c.id}" value="${c.remarks || ""}" style="width:100px;">
                <button onclick="saveRemarksCloud(${c.id})">Save</button>
            </td>
            <td style="color:${statusColor}; font-weight:bold;">${statusText}</td>
            <td><button onclick="deleteCase(${c.id})" style="background:red; color:white; border:none; padding:5px 10px; cursor:pointer;">Delete</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });

    if (upcomingCountEl) upcomingCountEl.innerText = upcomingCount;
    
    // Call the alert function if it exists
    if (typeof showUrgentAlerts === "function") {
        showUrgentAlerts(urgentHearings);
    }
}

async function saveRemarksCloud(id) {
    const remarkInput = document.getElementById("remarks-" + id);
    if (!remarkInput) return;
    
    const remarkText = remarkInput.value;

    const { error } = await _supabase
        .from('cases')
        .update({ remarks: remarkText })
        .eq('id', id); // Ensure this matches your column name 'id'

    if (error) {
        console.error("Supabase Error:", error);
        alert("Save failed: " + error.message);
    } else {
        alert("Remarks saved successfully");
    }
}

function viewFileCloud(fileData) {
    const newWindow = window.open();
    newWindow.document.write(`<html><body style="margin:0;"><embed src="${fileData}" width="100%" height="100%"></body></html>`);
}


function closePopup() {
  document.getElementById("hearingPopup").style.display = "none";
}

async function deleteCase(id) {
    if (confirm("Are you sure you want to delete this case?")) {
        const { error } = await _supabase
            .from('cases')
            .delete()
            .eq('id', id);
        
        if (error) alert("Delete failed");
        else loadDashboard(); // Refresh table
    }
}

function searchCase() {
  let input = document.getElementById("searchCase").value.toLowerCase();

  let table = document.getElementById("caseTable");

  let rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    let caseNumber = rows[i].cells[0].innerText.toLowerCase();

    if (caseNumber.includes(input)) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
}
function sortByDate() {
  let table = document.getElementById("caseTable");

  let rows = Array.from(table.rows);

  rows.sort(function (a, b) {
    // let dateA = new Date(a.cells[2].innerText);
    // let dateB = new Date(b.cells[2].innerText);
    let dateA = parseIndianDate(a.cells[2].innerText);
    let dateB = parseIndianDate(b.cells[2].innerText);

    if (sortAscending) {
      return dateA - dateB;
    } else {
      return dateB - dateA;
    }
  });

  rows.forEach((row) => table.appendChild(row));

  sortAscending = !sortAscending;
}
function saveRemarks(index) {

  let cases = JSON.parse(localStorage.getItem("cases")) || [];

  let remarkText = document.getElementById("remarks-" + index).value;

  cases[index].remarks = remarkText;

  localStorage.setItem("cases", JSON.stringify(cases));

  alert("Remarks saved successfully");

}

function viewFile(index) {
  let cases = JSON.parse(localStorage.getItem("cases")) || [];
  let caseData = cases[index];

  if (!caseData || !caseData.fileData) {
    alert("File not found!");
    return;
  }

  // Base64 ko Blob mein convert karein
  const base64Data = caseData.fileData;
  const parts = base64Data.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const uInt8Array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  const blob = new Blob([uInt8Array], { type: contentType });
  const url = URL.createObjectURL(blob);

  // Naya tab open karke usme PDF embed karein (Isse refresh nahi karna padega)
  const newWindow = window.open();
  newWindow.document.write(`
    <html>
      <head><title>Viewing Case: ${caseData.number}</title></head>
      <body style="margin:0;">
        <embed src="${url}" width="100%" height="100%" type="${contentType}">
      </body>
    </html>
  `);
}

function parseIndianDate(dateStr) {
    if (!dateStr) return new Date();
    // If the date contains '/', split by day, month, year
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
    }
    // Fallback for the old YYYY-MM-DD format
    return new Date(dateStr);
}

function downloadExcel() {
    // Identify which table we are looking at
    const tableBody = document.getElementById("caseTable") || document.getElementById("upcomingTable");
    const tableHeader = document.querySelector("thead");

    if (!tableBody || tableBody.rows.length === 0) {
        alert("No data available!");
        return;
    }

    let csvRows = [];
    const isUpcomingPage = !!document.getElementById("upcomingTable");

    // 1. Set Headers based on the page
    let headers = isUpcomingPage 
        ? ["Case Number", "Department", "Hearing Date", "Status"]
        : ["Case Number", "Department", "Hearing Date", "Remarks", "Status"];
    
    csvRows.push(headers.map(h => `"${h}"`).join(","));

    // 2. Get Row Data
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach(tr => {
        if (tr.style.display === "none") return; 

        let rowData = [];
        const cells = tr.querySelectorAll("td");

        if (isUpcomingPage) {
            // Upcoming Page Structure: 0:Num, 1:Dept, 2:Date, 3:File (Skip), 4:Status
            rowData.push(`"${cells[0].innerText.trim()}"`);
            rowData.push(`"${cells[1].innerText.trim()}"`);
            rowData.push(`"${cells[2].innerText.trim()}"`);
            let statusVal = cells[4] ? cells[4].innerText.replace("⚠ ", "").trim() : "";
            rowData.push(`"${statusVal}"`);
        } else {
            // Dashboard Structure: 0:Num, 1:Dept, 2:Date, 3:File (Skip), 4:Remarks, 5:Status
            rowData.push(`"${cells[0].innerText.trim()}"`);
            rowData.push(`"${cells[1].innerText.trim()}"`);
            rowData.push(`"${cells[2].innerText.trim()}"`);
            
            const remarkInput = cells[4].querySelector("input");
            let remarkVal = remarkInput ? remarkInput.value : cells[4].innerText;
            rowData.push(`"${remarkVal.replace(/"/g, '""').trim()}"`);
            
            let statusVal = cells[5] ? cells[5].innerText.replace("⚠ ", "").trim() : "";
            rowData.push(`"${statusVal}"`);
        }

        csvRows.push(rowData.join(","));
    });

    // 3. Trigger Download
    const csvString = csvRows.join("\n");
    const blob = new Blob(["\ufeff", csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = isUpcomingPage ? `Upcoming_Hearings_${new Date().toLocaleDateString()}.csv` : `Case_Dashboard_${new Date().toLocaleDateString()}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}


function showUrgentAlerts(urgentHearings) {
    const popup = document.getElementById("hearingPopup");
    const hearingList = document.getElementById("hearingList");

    // Only proceed if there are actual cases to show
    if (urgentHearings.length > 0) {
        if (hearingList) {
            hearingList.innerHTML = ""; // Clear any old alerts
            urgentHearings.forEach(msg => {
                const li = document.createElement("li");
                li.innerText = msg;
                li.style.color = "red";
                li.style.fontWeight = "bold";
                li.style.marginBottom = "5px";
                hearingList.appendChild(li);
            });
        }
        
        if (popup) {
            popup.style.display = "flex"; // Shows the popup
        }
    }
}