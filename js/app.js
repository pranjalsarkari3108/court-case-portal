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
    // This checks if the case number contains ONLY digits (0-9)
    if (!/^\d+$/.test(caseNumber)) {
        alert("Please enter a valid Case Number (Numbers only).");
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

// window.addEventListener("load", function () {
//   let upcomingTable = document.getElementById("upcomingTable");

//   if (!upcomingTable) return;

//   let cases = JSON.parse(localStorage.getItem("cases")) || [];

//   let today = new Date();

//   // cases.forEach((c) => {
//   cases.forEach((c, index) => {
//     if (!c.date || c.date.trim() === "") return;
//     // let hearing = new Date(c.date);
//     let hearing = parseIndianDate(c.date);

//     let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

//     if (diffDays <= 7 && diffDays >= 0) {
//       let row = upcomingTable.insertRow();

//       row.insertCell(0).innerText = c.number;
//       row.insertCell(1).innerText = c.department;
//       row.insertCell(2).innerText = c.date;
//       // if (c.fileData) {
//       //   row.insertCell(3).innerHTML =
//       //     `<a href="${c.fileData}" download="${c.fileName}">Download PDF</a>`;
//       // } else {
//       //   row.insertCell(3).innerText = "No File";
//       // }
//       // --- REPLACE THIS BLOCK IN the Upcoming Table listener ---
//       // if (c.fileData) {
//       //   row.insertCell(3).innerHTML = `
//       //     <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
//       //       <a href="${c.fileData}" target="_blank" style="text-decoration: none; color: #1F4E79; font-weight: bold;">View</a>
//       //       <span style="color: #ccc;">|</span>
//       //       <a href="${c.fileData}" download="${c.fileName}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
//       //     </div>`;
//       // } else {
//       //   row.insertCell(3).innerText = "No File";
//       // }
//       if (c.fileData) {
//         row.insertCell(3).innerHTML = `
//           <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
//             <span onclick="viewFile(${index})" style="cursor: pointer; color: #1F4E79; font-weight: bold;">View</span>
//             <span style="color: #ccc;">|</span>
//             <a href="${c.fileData}" download="${c.fileName}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
//           </div>`;
//       } else {
//         row.insertCell(3).innerText = "No File";
//       }

//       let status = row.insertCell(4);
//       if (diffDays === 0) {
//         status.innerHTML = "⚠ Hearing Today";
//         status.style.color = "red";
//       } else if (diffDays === 1) {
//         status.innerHTML = "⚠ Hearing Tomorrow";
//         status.style.color = "red";
//       } else if (diffDays <= 3) {
//         status.innerHTML = "⚠ Hearing in " + diffDays + " Days";
//         status.style.color = "orange";
//       } else {
//         status.innerHTML = "Hearing in " + diffDays + " Days";
//       }
//     }
//   });
// });

// 3. Function to Fetch Cases for Dashboard
// async function loadDashboard() {
//     const { data: cases, error } = await _supabase
//         .from('cases')
//         .select('*')
//         .order('hearing_date', { ascending: true });

//     if (error) {
//         console.error("Error fetching:", error);
//         return;
//     }

//     const tableBody = document.getElementById("caseTableBody");
//     if (!tableBody) return;
    
//     tableBody.innerHTML = ""; // Clear current rows

//     cases.forEach((c, index) => {
//         const row = `<tr>
//             <td>${index + 1}</td>
//             <td>${c.case_number}</td>
//             <td>${c.department}</td>
//             <td>${c.hearing_date}</td>
//             <td>${c.file_name !== "No File" ? `<a href="${c.file_data}" download="${c.file_name}">Download</a>` : "No File"}</td>
//             <td><button onclick="deleteCase(${c.id})" style="background:red; color:white;">Delete</button></td>
//         </tr>`;
//         tableBody.innerHTML += row;
//     });
// }

// async function loadDashboard() {
//     const { data: cases, error } = await _supabase
//         .from('cases')
//         .select('*')
//         .order('hearing_date', { ascending: true });

//     if (error) {
//         console.error("Error fetching:", error);
//         return;
//     }

//     // --- Update Stats ---
//     const totalCasesEl = document.getElementById("totalCases");
//     const upcomingCountEl = document.getElementById("upcomingCount");
//     if (totalCasesEl) totalCasesEl.innerText = cases.length;

//     const tableBody = document.getElementById("caseTableBody");
//     if (!tableBody) return;
//     tableBody.innerHTML = ""; 

//     let upcoming = 0;
//     let urgentHearings = [];
//     let today = new Date();

//     cases.forEach((c, index) => {
//         // --- Status & Alert Logic ---
//         let hearing = parseIndianDate(c.hearing_date);
//         let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));
        
//         let statusHtml = "Scheduled";
//         let statusColor = "black";

//         if (diffDays <= 7 && diffDays >= 0) upcoming++;

//         if (diffDays < 0) {
//             statusHtml = "Passed";
//             statusColor = "gray";
//         } else if (diffDays === 0) {
//             statusHtml = "⚠ Today";
//             statusColor = "red";
//             urgentHearings.push(`Case ${c.case_number} — Today`);
//         } else if (diffDays === 1) {
//             statusHtml = "⚠ Tomorrow";
//             statusColor = "red";
//             urgentHearings.push(`Case ${c.case_number} — Tomorrow`);
//         }

//         // --- Build Table Row ---
//         const row = `<tr>
//             <td>${c.case_number}</td>
//             <td>${c.department}</td>
//             <td>${c.hearing_date}</td>
//             <td>${c.file_name !== "No File" ? `<span onclick="viewFileCloud('${c.file_data}')" style="cursor:pointer; color:blue; text-decoration:underline;">View</span>` : "No File"}</td>
//             <td><input type="text" id="remarks-${c.id}" value="${c.remarks || ""}" style="width:100px;"> <button onclick="saveRemarksCloud(${c.id})">Save</button></td>
//             <td style="color:${statusColor}">${statusHtml}</td>
//             <td><button onclick="deleteCase(${c.id})" style="background:red; color:white;">Delete</button></td>
//         </tr>`;
//         tableBody.innerHTML += row;
//     });

//     if (upcomingCountEl) upcomingCountEl.innerText = upcoming;

//     // --- Show Popups ---
//     const popup = document.getElementById("hearingPopup");
//     const hearingList = document.getElementById("hearingList");
//     if (urgentHearings.length > 0 && popup) {
//         hearingList.innerHTML = "";
//         urgentHearings.forEach(h => {
//             let li = document.createElement("li");
//             li.innerText = h;
//             hearingList.appendChild(li);
//         });
//         popup.style.display = "flex";
//     }
// }

// async function loadUpcomingPage() {
//     const upcomingTable = document.getElementById("upcomingTable");
//     if (!upcomingTable) return;

//     // Fetch fresh data from Supabase
//     const { data: cases, error } = await _supabase
//         .from('cases')
//         .select('*')
//         .order('hearing_date', { ascending: true });

//     if (error) {
//         console.error("Error fetching for upcoming page:", error);
//         return;
//     }

//     upcomingTable.innerHTML = ""; // Clear old local data
//     let today = new Date();

//     cases.forEach((c) => {
//         let hearing = parseIndianDate(c.hearing_date);
//         let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

//         // Only show if hearing is within 7 days and hasn't passed
//         if (diffDays <= 7 && diffDays >= 0) {
//             let row = upcomingTable.insertRow();
//             row.insertCell(0).innerText = c.case_number;
//             row.insertCell(1).innerText = c.department;
//             row.insertCell(2).innerText = c.hearing_date;
            
//             // File View
//             let fileCell = row.insertCell(3);
//             fileCell.innerHTML = c.file_data 
//                 ? `<span onclick="viewFileCloud('${c.file_data}')" style="cursor:pointer; color:#1F4E79; font-weight:bold;">View</span>` 
//                 : "No File";

//             // Status
//             let status = row.insertCell(4);
//             if (diffDays === 0) {
//                 status.innerHTML = "⚠ Today";
//                 status.style.color = "red";
//             } else if (diffDays === 1) {
//                 status.innerHTML = "⚠ Tomorrow";
//                 status.style.color = "red";
//             } else {
//                 status.innerHTML = `In ${diffDays} days`;
//                 status.style.color = "orange";
//             }
//         }
//     });
// }

async function loadUpcomingPage() {
    const upcomingTable = document.getElementById("upcomingTable");
    if (!upcomingTable) return;

    const { data: cases, error } = await _supabase
        .from('cases')
        .select('*')
        .order('hearing_date', { ascending: true });

    if (error) {
        console.error("Supabase Error:", error);
        return;
    }

    upcomingTable.innerHTML = ""; // Clear table
    let today = new Date();

    cases.forEach((c) => {
        let hearing = parseIndianDate(c.hearing_date);
        let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

        // Show cases for the next 7 days
        if (diffDays <= 7 && diffDays >= 0) {
            const statusText = diffDays === 0 ? "⚠ Today" : (diffDays === 1 ? "⚠ Tomorrow" : `In ${diffDays} days`);
            const statusColor = diffDays <= 1 ? "red" : "orange";

            // We build the entire row at once to ensure the Download button is included
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
}

// async function loadDashboard() {
//     const { data: cases, error } = await _supabase
//         .from('cases')
//         .select('*')
//         .order('hearing_date', { ascending: true });

//     if (error) {
//         console.error("Error fetching from Supabase:", error);
//         return;
//     }

//     // 1. Update Top Stats
//     const totalCasesEl = document.getElementById("totalCases");
//     const upcomingCountEl = document.getElementById("upcomingCount");
//     if (totalCasesEl) totalCasesEl.innerText = cases.length;

//     // 2. Setup Table
//     const tableBody = document.getElementById("caseTable");
//     if (!tableBody) return;
//     tableBody.innerHTML = ""; // Clear the "Loading..." state

//     let upcomingCount = 0;
//     let urgentHearings = [];
//     let today = new Date();

//     // 3. Loop through Cloud Data
//     // cases.forEach((c) => {
//     //     let hearing = parseIndianDate(c.hearing_date);
//     //     let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

//     //     // Logic for counts and alerts
//     //     if (diffDays <= 7 && diffDays >= 0) upcomingCount++;
//     //     if (diffDays === 0) urgentHearings.push(`Case ${c.case_number} — Today`);
//     //     if (diffDays === 1) urgentHearings.push(`Case ${c.case_number} — Tomorrow`);

//     //     // Style status colors
//     //     let statusText = diffDays < 0 ? "Passed" : (diffDays === 0 ? "⚠ Today" : (diffDays === 1 ? "⚠ Tomorrow" : "Scheduled"));
//     //     let statusColor = diffDays <= 1 && diffDays >= 0 ? "red" : (diffDays < 0 ? "gray" : "#1F4E79");

//     //     const row = `<tr>
//     //         <td>${c.case_number}</td>
//     //         <td>${c.department}</td>
//     //         <td>${c.hearing_date}</td>
//     //         <td>
//     //             ${c.file_data ? `
//     //                 <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
//     //                     <span onclick="viewFileCloud('${c.id}')" style="cursor:pointer; color:#1F4E79; font-weight:bold;">View</span>
//     //                     <span style="color: #ccc;">|</span>
//     //                     <a href="${c.file_data}" download="${c.file_name || 'CaseFile.pdf'}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
//     //                 </div>` : "No File"}
//     //         </td>
//     //         <td>
//     //             <input type="text" id="remarks-${c.id}" value="${c.remarks || ""}" style="width:100px;">
//     //             <button onclick="saveRemarksCloud(${c.id})">Save</button>
//     //         </td>
//     //         <td style="color:${statusColor}; font-weight:bold;">${statusText}</td>
//     //         <td><button onclick="deleteCase(${c.id})" style="background:red; color:white; border:none; padding:5px 10px; cursor:pointer;">Delete</button></td>
//     //     </tr>`;
//     //     tableBody.innerHTML += row;
//     // });

//     cases.forEach((c) => {
//         let hearing = parseIndianDate(c.hearing_date);
//         let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

//         // Only show if hearing is within 7 days and hasn't passed
//         if (diffDays <= 7 && diffDays >= 0) {
//             let row = upcomingTable.insertRow();
//             row.insertCell(0).innerText = c.case_number;
//             row.insertCell(1).innerText = c.department;
//             row.insertCell(2).innerText = c.hearing_date;
            
//             // --- THIS IS THE PART YOU NEED ---
//             let fileCell = row.insertCell(3);
//             if (c.file_data) {
//                 fileCell.innerHTML = `
//                     <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
//                         <span onclick="viewFileCloud('${c.file_data}')" style="cursor:pointer; color:#1F4E79; font-weight:bold;">View</span>
//                         <span style="color: #ccc;">|</span>
//                         <a href="${c.file_data}" download="${c.file_name || 'CaseFile.pdf'}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
//                     </div>`;
//             } else {
//                 fileCell.innerText = "No File";
//             }

//             // Status Cell
//             let status = row.insertCell(4);
//             status.innerHTML = diffDays === 0 ? "⚠ Today" : (diffDays === 1 ? "⚠ Tomorrow" : `In ${diffDays} days`);
//             status.style.color = diffDays <= 1 ? "red" : "orange";
//         }
//     });

//     // Update the upcoming count UI
//     if (upcomingCountEl) upcomingCountEl.innerText = upcomingCount;

//     // 4. Handle Alerts Popup
//     showUrgentAlerts(urgentHearings);
// }

// async function saveRemarksCloud(id) {
//     const remarkText = document.getElementById("remarks-" + id).value;
//     const { error } = await _supabase.from('cases').update({ remarks: remarkText }).eq('id', id);
//     if (error) alert("Save failed");
//     else alert("Remarks saved successfully");
// }

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

// function deleteCase(index) {
//   let cases = JSON.parse(localStorage.getItem("cases")) || [];

//   cases.splice(index, 1);

//   localStorage.setItem("cases", JSON.stringify(cases));

//   location.reload();
// }
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

// function downloadExcel() {
//     // Identify which table body is currently being used
//     const tableBody = document.getElementById("caseTable") || document.getElementById("upcomingTable");
//     const tableHeader = document.querySelector("thead");

//     if (!tableBody || tableBody.rows.length === 0) {
//         alert("No data available to export!");
//         return;
//     }

//     let csv = [];
    
//     // 1. Get Column Headers (Skip 'Case File' and 'Action' as they have buttons)
//     let headerRow = [];
//     tableHeader.querySelectorAll("th").forEach(th => {
//         const text = th.innerText.replace("⬍", "").trim();
//         if (!["Case File", "Action", "Case File ⬍"].includes(text)) {
//             headerRow.push(text);
//         }
//     });
//     csv.push(headerRow.join(","));

//     // 2. Get Row Data
//     const rows = tableBody.querySelectorAll("tr");
//     rows.forEach(tr => {
//         if (tr.style.display === "none") return; // Skip rows hidden by search

//         let rowData = [];
//         tr.querySelectorAll("td").forEach(td => {
//             // Skip cells with View/Download/Delete buttons
//             if (td.innerText.includes("|") || td.querySelector("button") && !td.querySelector("input")) {
//                 return; 
//             }

//             // If it's a Remarks input, grab the text value
//             const input = td.querySelector("input");
//             if (input) {
//                 rowData.push(input.value.replace(/,/g, ";")); 
//             } else {
//                 rowData.push(td.innerText.replace(/,/g, ";"));
//             }
//         });
//         csv.push(rowData.join(","));
//     });

//     // 3. Create the Download
//     // 3. Create the Download with UTF-8 BOM for Hindi support
//     const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv.join("\n")], {
//         type: "text/csv;charset=utf-8"
//     });
    
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", `Court_Cases_Amroha_${new Date().toLocaleDateString()}.csv`);
    
//     document.body.appendChild(link);
//     link.click();
    
//     // Cleanup
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
// }

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



