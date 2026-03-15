// 1. Initialize Supabase
const _supabaseURL = "https://wtenziybnqmuevjwoami.supabase.co";
const _supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0ZW56aXlibnFtdWV2andvYW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MTE2NDQsImV4cCI6MjA4OTA4NzY0NH0.MSaxuJc7LbX0KR-NpD_XLiO5xxl1fPHpPpv9v9MpCr0";
const _supabase = supabase.createClient(_supabaseURL, _supabaseKey);

let sortAscending = true;

function login() {
  window.location.href = "dashboard.html";
}

window.onload = function () {
  let cases = JSON.parse(localStorage.getItem("cases")) || [];

  let table = document.getElementById("caseTable");

  let totalCases = document.getElementById("totalCases");
  let upcomingCount = document.getElementById("upcomingCount");

  if (totalCases) totalCases.innerText = cases.length;

  let upcoming = 0;
  let urgentHearings = [];

  if (table) {
    cases.forEach((c, index) => {
      let row = table.insertRow();

      row.insertCell(0).innerText = c.number;
      row.insertCell(1).innerText = c.department;
      row.insertCell(2).innerText = c.date;
      // if (c.fileData) {
      //   row.insertCell(3).innerHTML =
      //     `<a href="${c.fileData}" download="${c.fileName}">Download PDF</a>`;
      // } else {
      //   row.insertCell(3).innerText = "No File";
      // }
      // --- REPLACE THIS BLOCK IN window.onload ---
      // if (c.fileData) {
      //   row.insertCell(3).innerHTML = `
      //     <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
      //       <a href="${c.fileData}" target="_blank" style="text-decoration: none; color: #1F4E79; font-weight: bold;">View</a>
      //       <span style="color: #ccc;">|</span>
      //       <a href="${c.fileData}" download="${c.fileName}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
      //     </div>`;
      // } else {
      //     row.insertCell(3).innerText = "No File";
      // }

      if (c.fileData) {
        row.insertCell(3).innerHTML = `
          <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
            <span onclick="viewFile(${index})" style="cursor: pointer; color: #1F4E79; font-weight: bold;">View</span>
            <span style="color: #ccc;">|</span>
            <a href="${c.fileData}" download="${c.fileName}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
          </div>`;
      } else {
        row.insertCell(3).innerText = "No File";
      }

      let remarksCell = row.insertCell(4);

      remarksCell.innerHTML = `<input type="text" id="remarks-${index}" value="${c.remarks || ""}" style="width:120px;">
<button onclick="saveRemarks(${index})">Save</button>`;

      let statusCell = row.insertCell(5);

      let today = new Date();
      // let hearing = new Date(c.date);
      let hearing = parseIndianDate(c.date);

      let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7 && diffDays >= 0) {
        upcoming++;
      }
      if (diffDays < 0) {
        statusCell.innerHTML = "Hearing date passed";
        statusCell.style.color = "gray";
      } else if (diffDays === 0) {
        statusCell.innerHTML = "⚠ Hearing Today";
        statusCell.style.color = "red";
      } else if (diffDays === 1) {
        statusCell.innerHTML = "⚠ Hearing Tomorrow";
        statusCell.style.color = "red";
      } else if (diffDays <= 3) {
        statusCell.innerHTML = "⚠ Hearing in " + diffDays + " Days";
        statusCell.style.color = "orange";
      } else if (diffDays <= 7) {
        statusCell.innerHTML = "Hearing in " + diffDays + " Days";
        statusCell.style.color = "#1F4E79";
      } else {
        statusCell.innerHTML = "Scheduled";
      }

      let actionCell = row.insertCell(6);

      actionCell.innerHTML = `<button onclick="deleteCase(${index})">Delete</button>`;

      if (diffDays === 0) {
        urgentHearings.push("Case " + c.number + " — Hearing Today");
      }

      if (diffDays === 1) {
        urgentHearings.push("Case " + c.number + " — Hearing Tomorrow");
      }
    });
  }

  if (upcomingCount) upcomingCount.innerText = upcoming;

  let popup = document.getElementById("hearingPopup");
  let hearingList = document.getElementById("hearingList");

  if (urgentHearings.length > 0 && popup) {
    urgentHearings.forEach((h) => {
      let li = document.createElement("li");
      li.innerText = h;
      hearingList.appendChild(li);
    });

    popup.style.display = "flex";
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
    const caseNumber = document.getElementById("caseNumber").value;
    const department = document.getElementById("department").value;
    const hearingDate = document.getElementById("hearingDate").value;
    const fileInput = document.getElementById("caseFile");
    const file = fileInput.files[0];

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
        alert("Case Saved to Cloud successfully!");
        window.location.href = "dashboard.html";
    }
}

window.addEventListener("load", function () {
  let upcomingTable = document.getElementById("upcomingTable");

  if (!upcomingTable) return;

  let cases = JSON.parse(localStorage.getItem("cases")) || [];

  let today = new Date();

  // cases.forEach((c) => {
  cases.forEach((c, index) => {
    if (!c.date || c.date.trim() === "") return;
    // let hearing = new Date(c.date);
    let hearing = parseIndianDate(c.date);

    let diffDays = Math.ceil((hearing - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7 && diffDays >= 0) {
      let row = upcomingTable.insertRow();

      row.insertCell(0).innerText = c.number;
      row.insertCell(1).innerText = c.department;
      row.insertCell(2).innerText = c.date;
      // if (c.fileData) {
      //   row.insertCell(3).innerHTML =
      //     `<a href="${c.fileData}" download="${c.fileName}">Download PDF</a>`;
      // } else {
      //   row.insertCell(3).innerText = "No File";
      // }
      // --- REPLACE THIS BLOCK IN the Upcoming Table listener ---
      // if (c.fileData) {
      //   row.insertCell(3).innerHTML = `
      //     <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
      //       <a href="${c.fileData}" target="_blank" style="text-decoration: none; color: #1F4E79; font-weight: bold;">View</a>
      //       <span style="color: #ccc;">|</span>
      //       <a href="${c.fileData}" download="${c.fileName}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
      //     </div>`;
      // } else {
      //   row.insertCell(3).innerText = "No File";
      // }
      if (c.fileData) {
        row.insertCell(3).innerHTML = `
          <div style="display: flex; gap: 8px; justify-content: center; align-items: center;">
            <span onclick="viewFile(${index})" style="cursor: pointer; color: #1F4E79; font-weight: bold;">View</span>
            <span style="color: #ccc;">|</span>
            <a href="${c.fileData}" download="${c.fileName}" style="text-decoration: none; color: #28a745; font-weight: bold;">Download</a>
          </div>`;
      } else {
        row.insertCell(3).innerText = "No File";
      }

      let status = row.insertCell(4);
      if (diffDays === 0) {
        status.innerHTML = "⚠ Hearing Today";
        status.style.color = "red";
      } else if (diffDays === 1) {
        status.innerHTML = "⚠ Hearing Tomorrow";
        status.style.color = "red";
      } else if (diffDays <= 3) {
        status.innerHTML = "⚠ Hearing in " + diffDays + " Days";
        status.style.color = "orange";
      } else {
        status.innerHTML = "Hearing in " + diffDays + " Days";
      }
    }
  });
});

// 3. Function to Fetch Cases for Dashboard
async function loadDashboard() {
    const { data: cases, error } = await _supabase
        .from('cases')
        .select('*')
        .order('hearing_date', { ascending: true });

    if (error) {
        console.error("Error fetching:", error);
        return;
    }

    const tableBody = document.getElementById("caseTableBody");
    if (!tableBody) return;
    
    tableBody.innerHTML = ""; // Clear current rows

    cases.forEach((c, index) => {
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${c.case_number}</td>
            <td>${c.department}</td>
            <td>${c.hearing_date}</td>
            <td>${c.file_name !== "No File" ? `<a href="${c.file_data}" download="${c.file_name}">Download</a>` : "No File"}</td>
            <td><button onclick="deleteCase(${c.id})" style="background:red; color:white;">Delete</button></td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

// function deleteCase(index) {
//   let cases = JSON.parse(localStorage.getItem("cases")) || [];

//   cases.splice(index, 1);

//   localStorage.setItem("cases", JSON.stringify(cases));

//   location.reload();
// }
// function closePopup() {
//   document.getElementById("hearingPopup").style.display = "none";
// }

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