
    async function exportFilteredTable() {
    const startDateStr = document.getElementById("startDate").value;
    const endDateStr = document.getElementById("endDate").value;

    const startDate = startDateStr ? new Date(startDateStr + "T00:00:00") : null;
    const endDate = endDateStr ? new Date(endDateStr + "T23:59:59") : null;

    const dataTable = $('#dataTable').DataTable();
    const allRows = dataTable.rows({ search: 'applied' }).data().toArray();

    const exportData = [];

    // Header Excel
    const header = [
        "OC Date", "OC #", "Sales", "Customer", "Status", "SPK #",
        "Nama Barang", "Subtotal", "PPN", "Total All"
    ];
    exportData.push(header);

    for (const row of allRows) {
        // Ambil nilai teks dari HTML (agar aman dari tag)
        const ocDate = $('<div>').html(row[1]).text().trim(); // dd-mm-yyyy
        const [day, month, year] = ocDate.split("-");
        const rowDate = new Date(`${year}-${month}-${day}`);

        if (startDate && endDate) {
            if (rowDate < startDate || rowDate > endDate) continue;
        }

        const oc = $('<div>').html(row[2]).text().trim();
        const sales = $('<div>').html(row[3]).text().trim();
        const customer = $('<div>').html(row[4]).text().trim();
        const status = $('<div>').html(row[5]).text().trim();
        const spk = $('<div>').html(row[6]).text().trim();

        let namabarang = "-", subtotal = "", ppn = "", totalall = "";

        try {
            const res = await fetch(`get_data_oc.php?oc=${encodeURIComponent(oc)}`);
            const data = await res.json();
            if (data && !data.error) {
                namabarang = data.dataBarangOC?.map(item => item.namabarang).join(", ") || "-";
                subtotal = data.subtotal ?? "";
                ppn = data.ppn ?? "";
                totalall = data.totalall ?? "";
            }
        } catch (e) {
            console.error("Gagal ambil data OC:", e);
        }

        exportData.push([
            ocDate, oc, sales, customer, status, spk,
            namabarang, subtotal, ppn, totalall
        ]);
    }

    if (exportData.length === 1) {
        alert("Tidak ada data yang cocok dengan rentang tanggal.");
        return;
    }

    // Buat worksheet
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // Otomatis lebar kolom berdasarkan isi terpanjang
    const columnWidths = header.map((_, colIndex) => {
        const maxLength = exportData.reduce((max, row) => {
            const cell = row[colIndex];
            return Math.max(max, (cell ? cell.toString().length : 0));
        }, 10);
        return { wch: maxLength + 2 };
    });
    ws['!cols'] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Export OC");
    XLSX.writeFile(wb, "export_oc.xlsx");
}



function openNamabarangOCModal(namabarang) {
    // Set the title for the item
    const namabarangTitle = document.getElementById('namabarangTitle');
    namabarangTitle.innerText = namabarang;  // Display the item name in the modal header

    // Fetch OC details for the given 'namabarang'
    fetch(`getOCDetailsByNamabarang.php?namabarang=${encodeURIComponent(namabarang)}`)
        .then(response => response.json())  // Parse JSON response
        .then(data => {
            const orderDetailsTableBody = document.getElementById("orderDetailsTableBody");
            orderDetailsTableBody.innerHTML = "";  // Clear previous data

            // Check if data exists
            if (data && data.length > 0) {
                // Populate the table with the fetched OC details
                data.forEach(item => {
                    const row = document.createElement("tr");

                    // Create table rows with OC data
                    row.innerHTML = `
                        <td>${item.tgloc}</td>
                        <td>${item.oc}</td>
                        <td>${item.namacustomer}</td>

                        <td>${item.qty} ${item.satuan}</td>

                        <td>${item.price}</td>

                    `;

                    // Append the row to the table body
                    orderDetailsTableBody.appendChild(row);
                });
            } else {
                // Handle case when no data is returned
                orderDetailsTableBody.innerHTML = "<tr><td colspan='5'>No OC data found for the selected item.</td></tr>";
            }
        })
        .catch(error => {
            // Handle fetch errors
            console.error('Error fetching OC details:', error);
            document.getElementById("orderDetailsTableBody").innerHTML = "<tr><td colspan='5'>Error loading data.</td></tr>";
        });

    // Ensure the modal is visible
    const OCDetailsByNamabarang = document.getElementById('namabarangocModal');
    const myModal = document.getElementById('myModal');

    // Check if the modal elements exist before changing their styles
    if (OCDetailsByNamabarang && myModal) {
        OCDetailsByNamabarang.style.display = 'block';  // Show the details modal
        myModal.style.display = 'none';  // Hide the main modal
    } else {
        console.error("Modal elements not found.");
    }
}



    // Fungsi untuk membuka Order Details Module
function openOrderDetailsModule() {
    const customerName = document.getElementById("namacustomerDisplay").innerText; // Ambil nama customer
    console.log("Customer Name:", customerName);
    
    // Menampilkan nama customer di bawah "Riwayat Order"
    const customerNameDisplay = document.getElementById("customerNameDisplay");
    customerNameDisplay.innerHTML = `${customerName}`;  // Tampilkan nama customer

    // Memuat data order berdasarkan nama customer
    fetch(`getOrderDetails?customer=${customerName}`)
        .then(response => response.json())
        .then(data => {
            const orderTableBody = document.querySelector("#orderTable tbody");
            orderTableBody.innerHTML = ""; // Kosongkan tabel sebelum menambahkan data

            if (data.length > 0) {
                console.log("Data Retrieved:", data);
                // Mengambil nama customer dari item pertama (asumsi nama customer sama untuk seluruh data)
                const namacustomer = data[0].namacustomer || 'Nama Customer Tidak Ditemukan';
                console.log("Customer Name from Data:", namacustomer);

                // Menampilkan nama customer dari item
                customerNameDisplay.innerHTML = `${namacustomer}`;  

                // Menambahkan data ke dalam tabel
                let no = 1;
                data.forEach(item => {
                    const tgloc = item.tgloc;
                    const oc = item.oc;
                    const totalall = item.totalall;
                    const namabarangList = item.namabarang.split("<br>");
                    const qtyList = item.qty.split("<br>");
                    const satuanList = item.satuan.split("<br>");

                    // Menambahkan row untuk setiap OC
                    for (let i = 0; i < namabarangList.length; i++) {
                        const row = document.createElement("tr");

                        // Kolom No
                        const noCell = document.createElement("td");
                        noCell.innerText = no++;  
                        row.appendChild(noCell);

                        // Kolom Tgloc
                        const tglocCell = document.createElement("td");
                        tglocCell.innerText = tgloc;
                        row.appendChild(tglocCell);

                        // Kolom OC
                        const ocCell = document.createElement("td");
                        ocCell.innerText = oc;
                        row.appendChild(ocCell);

                        // Kolom Namabarang
                        const nameCell = document.createElement("td");
                        nameCell.innerHTML = namabarangList[i];  
                        row.appendChild(nameCell);

                        // Kolom Qty
                        const qtyCell = document.createElement("td");
                        qtyCell.innerHTML = qtyList[i];  
                        row.appendChild(qtyCell);

                        // Kolom Satuan
                        const satuanCell = document.createElement("td");
                        satuanCell.innerHTML = satuanList[i];  
                        row.appendChild(satuanCell);

                        // Kolom Grand Total
                        const totalallCell = document.createElement("td");
                        totalallCell.innerText = totalall;
                        row.appendChild(totalallCell);

                        // Menambahkan row ke tabel
                        orderTableBody.appendChild(row);
                    }
                });
            } else {
                console.log("No data found");
                orderTableBody.innerHTML = "<tr><td colspan='7'>Data tidak ditemukan</td></tr>";
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            const orderTableBody = document.querySelector("#orderTable tbody");
            orderTableBody.innerHTML = "<tr><td colspan='7'>Terjadi kesalahan dalam memuat data.</td></tr>";
        });

    // Menyembunyikan modal utama dan menampilkan modal detail
    console.log("Opening Order Details Modal...");
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const myModal = document.getElementById('myModal');

    orderDetailsModal.style.display = 'block';  // Menampilkan modal detail
    myModal.style.display = 'none';  // Menutup modal utama
}

// Fungsi untuk kembali ke modul order confirmation
function backToOrderConfirmation() {
    console.log("Going back to Order Confirmation...");
    
    // Menyembunyikan modal detail
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const myModal = document.getElementById('myModal');
    
    orderDetailsModal.style.display = 'none';  // Menutup modal detail
    console.log("orderDetailsModal Display after close:", orderDetailsModal.style.display);
    
    // Menunggu sejenak sebelum menampilkan modal utama
    setTimeout(() => {
        myModal.style.display = 'block';  // Menampilkan modal utama
        console.log("myModal Display after open:", myModal.style.display);
    }, ); // Menunggu 200ms
}

function backToOrderConfirmation1() {
    console.log("Going back to Order Confirmation...");
    
    // Menyembunyikan modal detail
    const namabarangocModal = document.getElementById('namabarangocModal');
    const myModal = document.getElementById('myModal');
    
    namabarangocModal.style.display = 'none';  // Menutup modal detail
    console.log("orderDetailsModal Display after close:", namabarangocModal.style.display);
    
    // Menunggu sejenak sebelum menampilkan modal utama
    setTimeout(() => {
        myModal.style.display = 'block';  // Menampilkan modal utama
        console.log("myModal Display after open:", myModal.style.display);
    }, ); // Menunggu 200ms
}



// Fungsi untuk menutup semua modal
function closeAllModals() {
    console.log("Closing all modals...");
    const myModal = document.getElementById('myModal');
    const orderDetailsModal = document.getElementById('orderDetailsModal');

    const    namabarangocModal = document.getElementById('namabarangocModal');

    
    myModal.style.display = 'none';  // Menutup modal utama
    orderDetailsModal.style.display = 'none';  // Menutup modal detail

    
    namabarangocModal.style.display = 'none';  // Menutup modal detail

}

// Fungsi untuk membuka modal utama
function openModal() {
    console.log("Opening Modal...");
    const myModal = document.getElementById('myModal');
    myModal.style.display = 'block';  // Menampilkan modal utama
}
